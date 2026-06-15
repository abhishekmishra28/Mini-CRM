const model =
require(
 "../config/gemini"
);

const Customer =
require(
 "../models/Customer"
);

const Campaign =
require(
 "../models/Campaign"
);

async function chat(
 prompt
){

 const response =

 await model.generateContent(
  prompt
 );

 return response
 .response
 .text();

}

async function generateSegment(
 prompt
){

 const systemPrompt =

`
Convert the user's request into CRM segment JSON.

Return ONLY JSON.

Format:

{
 "name":"",
 "description":"",
 "operator":"AND",

 "conditions":[
   {
     "field":"",
     "op":"",
     "value":""
   }
 ]
}
`;

 const response =

 await model.generateContent(

 systemPrompt +

 "\n\nUser: " +

 prompt

 );

 return response
 .response
 .text();

}
async function generateMessage(
 prompt
){

 const systemPrompt =

`
Generate a concise marketing message.

Rules:

Keep under 200 characters.

Return plain text.
`;

 const response =

 await model.generateContent(

 systemPrompt +

 "\n\nUser:" +

 prompt

 );

 return response
 .response
 .text();

}

async function getInsights(){

 const customers =

 await Customer.find();

 const campaigns =

 await Campaign.find();

 const prompt =

`
Analyze this CRM data.

Customers:

${JSON.stringify(
 customers.slice(0,20)
)}

Campaigns:

${JSON.stringify(
 campaigns.slice(0,20)
)}

Provide business insights.
`;

 const response =

 await model.generateContent(
  prompt
 );

 return response
 .response
 .text();

}

module.exports = {

 chat,

 generateSegment,

 generateMessage,

 getInsights

};