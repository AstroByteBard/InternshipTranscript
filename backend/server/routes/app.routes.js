const settingsRoutes = require("../Project/Settings/settings.routes");
const AcademicRoutes = require("../Project/Academic/Academic.routes");
const StudentsRoutes = require("../Project/Students/students.routes");


// const sync = require("../sync/mis");
module.exports = function (app) {

  var path = "/api/v1";
  // app.use(path, googleRoutes.onDistance )
  app.use(path + '/academic', AcademicRoutes); // complete
  app.use(path + '/students', StudentsRoutes); // complete
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




