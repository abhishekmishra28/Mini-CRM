const customerService =

require(
 "../services/customer.service"
);

async function getCustomers(
 req,
 res
){

 try{

  const data =

  await customerService
  .getAllCustomers();

  res.json(data);

 }
 catch(error){

  res.status(500)
  .json({
   message:error.message
  });

 }

}

async function getCustomer(
 req,
 res
){

 try{

  const data =

  await customerService
  .getCustomerById(
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

async function createCustomer(
 req,
 res
){

 try{

  const data =

  await customerService
  .createCustomer(
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

async function updateCustomer(
 req,
 res
){

 try{

  const data =

  await customerService
  .updateCustomer(

   req.params.id,

   req.body

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

async function deleteCustomer(
 req,
 res
){

 try{

  await customerService
  .deleteCustomer(
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

 getCustomers,

 getCustomer,

 createCustomer,

 updateCustomer,

 deleteCustomer

};