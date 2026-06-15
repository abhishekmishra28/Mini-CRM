const segmentService =
require(
 "../services/segment.service"
);

async function getSegments(
 req,
 res
){

 try{

  const data =
  await segmentService
  .getAllSegments();

  res.json(data);

 }
 catch(error){

  res.status(500)
  .json({
   message:error.message
  });

 }

}

async function createSegment(
 req,
 res
){

 try{

  const data =
  await segmentService
  .createSegment(
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

async function deleteSegment(
 req,
 res
){

 try{

  await segmentService
  .deleteSegment(
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

async function getCustomers(
 req,
 res
){

 try{

  const data =
  await segmentService
  .getSegmentCustomers(
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

module.exports = {

 getSegments,

 createSegment,

 deleteSegment,

 getCustomers

};