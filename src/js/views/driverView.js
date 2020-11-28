import driverImages from "../../img/driver_info/*.png";
import { mean, std } from "mathjs";

class DriverView {
  _driverInfoElement = document.querySelector("#driver__info");
  _driverImageContainer = document.querySelector("#driver__image__container");
  _driverImageElement = document.querySelector("#driver__image");
  _driverTextContainer = document.querySelector("#driver__text__container");
  _driverFantasyPointsContainer = document.querySelector("#driver__fantasy");

  renderDriverInfo(driverInfo) {
    this.renderDriverImage(driverInfo["driverId"]);
    this.renderDriverText(driverInfo);
  }

  renderDriverImage(driverId) {
    this._driverImageElement.src = driverImages[driverId];
  }

  renderDriverText(driverInfo) {
    this._driverTextContainer.innerHTML = `
            <h1>${driverInfo["givenName"]} ${driverInfo["familyName"]}</h1>
            <table>
                <tr>
                    <td><b>Date of birth: </b></td><td>${driverInfo["dateOfBirth"]}</td>
                </tr>
                <tr>
                    <td><b>Nationality: </b></td><td>${driverInfo["nationality"]}</td>
                </tr>
                <tr>
                    <td><b>Number: </b></td><td>${driverInfo["permanentNumber"]}</td>
                </tr>
                <tr>
                    <td><b>Wiki: </b></td><td><a href=${driverInfo["url"]} target="_blank">${driverInfo["url"]}</a></td>
                </tr>
            </table>
        `;
  }

  renderFantasyPoints(dataset) {
    let fantasyMean = Math.round(mean(dataset["fantasyPoints"]) * 100) / 100;
    let fantasyStd = Math.round(std(dataset["fantasyPoints"]) * 100) / 100;

    let htmlRows = ``;
    for (let i = 0; i < dataset["raceNames"].length; i++) {
      htmlRows += `
                <tr>
                    <td>${dataset["raceNames"][i]}</td>
                    <td>${dataset["fantasyPoints"][i]}</td>
                </tr>`;
    }

    this._driverFantasyPointsContainer.innerHTML = `
            <h1>Fantasy points</h1>
            <table id="ftable__left" class="fantasy-table">
                <thead>
                    <tr>
                        <th>Race</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlRows}
                </tbody>
            </table>

            <table id="ftable__right" class="fantasy-table">
                <thead>
                    <tr>
                        <th>Points per race</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Mean</td>
                        <td>${fantasyMean}</td>
                    </tr>
                    <tr>
                        <td>Std</td>
                        <td>${fantasyStd}</td>
                    </tr>
                    
                </tbody>
            </table>`;
  }
}

export default new DriverView();
