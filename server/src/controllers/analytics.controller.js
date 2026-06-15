const analyticsService =

require(

 "../services/analytics.service"

);

async function getAnalytics(

 req,

 res

){

 try{

  const data =

  await analyticsService

  .getDashboardAnalytics();

  res.json(data);

 }

 catch(error){

  res.status(500)

  .json({

   message:error.message

  });

 }

}

module.exports = {

 getAnalytics

};