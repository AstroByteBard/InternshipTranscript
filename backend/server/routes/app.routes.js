const settingsRoutes = require("../Project/Settings/settings.routes");
const organizationRoutes = require("../Project/Organization/organization.routes");

// const sync = require("../sync/mis");
module.exports = function (app) {

  var path = "/api/v1";
  // app.use(path, googleRoutes.onDistance )

  app.use(path + '/organization', organizationRoutes); // complete
  app.use(path + '/setting', settingsRoutes); // complete
  // app.use(path + '/address', addressRoutes); // complete

  //
  // app.use(path , accountRoutes);

  // hr service
  // app.use(path + '', hrAccountRoutes);
  // app.use(path + '/system', accountAdminRoutes);
  //
  // app.use(path + '/application', applicationRoutes);


};




