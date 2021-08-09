let Global = {};
Global.data = "Welcome to Spacecode!"
Global.oldData = "Welcome to Old Spacecode!"
Global.event_id = "";
Global.getResponseObject = (status, errors, data, dataArray) => {
    if (status === false && errors.msg === undefined) {
        errors.msg = "No Error Defined";
    }
    let responseObj = {};
    responseObj.status = status;
    responseObj.errors = errors;
    responseObj.data = (data === undefined) ? {} : data;
    responseObj.dataArray = (dataArray === undefined) ? [] : dataArray;
    return responseObj;
};

Global.deviceData1 = {
    data: "",
    oldData: "",
    event_id: ""
}
Global.deviceData2 = {
    data: "",
    oldData: "",
    event_id: ""
}

module.exports = Global;
