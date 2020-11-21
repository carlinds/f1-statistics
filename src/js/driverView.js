import driverImages from "../img/driver_info/*.png";

class DriverView {
    _driverInfoElement = document.querySelector('#driver__info');
    _driverImageContainer = document.querySelector('#driver__image__container');
    _driverImageElement = document.querySelector('#driver__image');
    _driverTextContainer = document.querySelector('#driver__text__container');

    renderDriverInfo(driverInfo) {
        this.renderDriverImage(driverInfo["driverId"]);
        this.renderDriverText(driverInfo);
    }

    renderDriverImage(driverId) {
        this._driverImageElement.src = driverImages[driverId];
    };

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
    };
};

export default new DriverView();
