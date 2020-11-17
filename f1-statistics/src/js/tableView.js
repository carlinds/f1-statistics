import icons from '../img/*.png';

class TableView {
  _tableBodyElement = document.querySelector('.table-body');
  _searchFieldElement = document.querySelector('#race__name');
  _searchButtonElement = document.querySelector('#search__button');

  init() {
    for (let i = 0; i < 20; i++) {
      const html = `
        <tr class="table-row">
          <td></td>
          <td></td>
          <td></td>
          <td></img></td>
          <td></td>
        </tr>`;
      this._tableBodyElement.insertAdjacentHTML('beforeend', html);
    }
  }

  addHandlerSearch(handler) {
    this._searchButtonElement.addEventListener('click', function () {
      handler();
    });
  }

  addHandlerDriverSelection(handler) {
    const rows = document.querySelectorAll('.table-row');
    rows.forEach(element => {
      element.addEventListener('click', function () {
        TableView.rowSelector(this);
        handler();
      });
    });
  }

  renderRaceEntries(data) {
    data.forEach(element => {
      const html = `
          <option value="${element.round}">${element.raceName}</option>
        `;

      this._searchFieldElement.insertAdjacentHTML('beforeend', html);
    });
    const lastHtml = '<option value="last" selected>Last race</option>';
    this._searchFieldElement.insertAdjacentHTML('afterbegin', lastHtml);
  }

  renderRaceResults(data) {
    const rows = document.querySelectorAll('.table-row');

    for (let i = 0; i < data.length; i++) {
      const dataEntry = data[i];
      let row = rows[i];
      const img_name = dataEntry.Constructor.constructorId + '_logo';
      row.innerHTML = `
          <tr class="table-row" id="${dataEntry.Driver.driverId}">
              <td>${dataEntry.position}</td>
              <td>${dataEntry.Driver.givenName} ${dataEntry.Driver.familyName}</td>
              <td>${dataEntry.number}</td>
              <td><img src="${icons[img_name]}" class="constructor__logo"></img>${dataEntry.Constructor.name}</td>
              <td>${dataEntry.points}</td>
          </tr>
        `;
    }
  }

  static rowSelector(row) {
    // Remove prev. selected row
    const rows = document.querySelectorAll('.table-row');
    rows.forEach(element => {
      element.classList.remove('selected-row');
    });

    // Highlight new selected row
    row.classList.add('selected-row');
  }
}

export default new TableView();
