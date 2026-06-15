const aiService =

require(
 "../services/ai.service"
);

async function chat(
 req,
 res
){

 const data =

 await aiService.chat(
  req.body.prompt
 );

 res.json({
  response:data
 });

}

async function generateSegment(
 req,
 res
){

 const data =

 await aiService.generateSegment(
  req.body.prompt
 );

 res.json({
  response:data
 });

}

async function generateMessage(
 req,
 res
){

 const data =

 await aiService.generateMessage(
  req.body.prompt
 );

 res.json({
  response:data
 });

}

async function insights(
 req,
 res
){

 const data =

 await aiService.getInsights();

 res.json({
  response:data
 });

}

module.exports = {

 chat,

 generateSegment,

 generateMessage,

 insights

};