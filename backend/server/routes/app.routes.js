const settingsRoutes = require("../Project/Settings/settings.routes");
const AcademicRoutes = require("../Project/Academic/Academic.routes");
const MemberRoutes = require("../Project/Member/Member.routes");
const CompetenciesRoutes = require("../Project/Competencies/Competencies.routes");
const EmailRoutes = require("../Project/Email/Email.routes")


// const sync = require("../sync/mis");
module.exports = function (app) {

  var path = "/api/v1";
  // app.use(path, googleRoutes.onDistance )
  app.use(path + '/email' , EmailRoutes)
  app.use(path + '/competencies', CompetenciesRoutes) // complete
  app.use(path + '/academic', AcademicRoutes); // complete
  app.use(path + '/member', MemberRoutes); // complete
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




