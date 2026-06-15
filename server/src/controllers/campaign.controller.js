const campaignService =
require(
 "../services/campaign.service"
);

async function getCampaigns(
 req,
 res
){

 try{

  const data =
  await campaignService
  .getAllCampaigns();

  res.json(data);

 }
 catch(error){

  res.status(500)
  .json({
   message:error.message
  });

 }

}

async function createCampaign(
 req,
 res
){

 try{

  const data =
  await campaignService
  .createCampaign(
   req.body
  );

  res.status(201)
  .json(data);

 }
 catch(error){

  res.status(500)
  .json({
   message:error.message
  });

 }

}

async function sendCampaign(
 req,
 res
){

 try{

  const data =
  await campaignService
  .sendCampaign(
   req.params.id
  );

  res.json(data);

 }
 catch(error){

  res.status(500)
  .json({
   message:error.message
  });

 }

}

async function deleteCampaign(
 req,
 res
){

 try{

  await campaignService
  .deleteCampaign(
   req.params.id
  );

  res.json({
   message:"Deleted"
  });

 }
 catch(error){

  res.status(500)
  .json({
   message:error.message
  });

 }

}

module.exports = {

 getCampaigns,

 createCampaign,

 sendCampaign,

 deleteCampaign

};