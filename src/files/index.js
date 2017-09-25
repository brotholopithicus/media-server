require('./index.css');

const { h, app } = require('hyperapp');

const pad = n => (n < 10 ? '0' + n : n);

const humanizeTime = t => {
  const hours = (t / 3600) >> 0;
  const minutes = ((t - hours * 3600) / 60) >> 0;
  const seconds = (t - hours * 3600 - minutes * 60) >> 0;
  return `${pad(minutes)}:${pad(seconds)}`;
}

app({
  state: {
    files: [],
  },
  view: (state, actions) =>
    <main class="container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th class="name">name</th>
            <th>mimetype</th>
            <th onclick={() => actions.sortBy('size')}>size</th>
            <th class="watch">watch</th>
            <th class="copy">link</th>
          </tr>
        </thead>
        <tbody>
          {state.files.map((f, index) => (
            <FileRow
              id={f.id}
              name={f.name}
              mimetype={f.mimetype}
              size={f.size}
              num={index + 1}
            />
          )
        )}
        </tbody>
      </table>
    </main>,
  actions: {
    populate: (state, actions, { files = [], isFetching }) => { files, isFetching },
    getFiles: (state, actions) => {
      fetch('/api').then(r => r.json()).then(files => {
        actions.setFiles(files);
      });
    },
    sortBy: (state, actions, method) => {
      const files = state.files.sort((a, b) => a[method] < b[method] ? -1 : 1);
      return actions.setFiles(files);
    },
    setFiles: (state, actions, files) => ({ files }),
    toggleFetching: state => ({ isFetching: !state.isFetching })
  },
  events: {
    load: (state, actions) => {
      actions.getFiles();
    }
  }
})
const fetchAsync = async(url) => await (await fetch(url)).json();

function FileRow({ id, num, name, mimetype, size }) {
  return (
    <tr>
      <th>{num}</th>
      <td>{name}</td>
      <td>{mimetype}</td>
      <td>{Math.round(size * 1e-6)} MB</td>
      <td class="watch">↓</td>
      <td class="copy">✂</td>
    </tr>
  )
}
