const Sib = require('sib-api-v3-sdk');
const uuid=require('uuid');
const bcrypt=require('bcrypt');

const ForgetPasswordRequest=require('../model/ForgetPasswordRequest');
const User=require('../model/user');
const forgetPasswordRequest = require('../model/ForgetPasswordRequest');



const client = Sib.ApiClient.instance;
const apiKey=client.authentications['api-key'];
apiKey.apiKey='';
const tranEmailApi=new Sib.TransactionalEmailsApi();
const sender={
	email:'',
	name:''
}
exports.sendMail=async(req,res,next)=>{
	const uuidV4=uuid.v4();
	const user=await User.findOne({where:{email:req.body.email}});
	if(user){
		console.log(uuidV4+" "+user.id);
		await ForgetPasswordRequest.create({id:uuidV4,isactive:true,userId:user.id});
		const reciever=[{
			email:req.body.email
		}]
		await tranEmailApi.sendTransacEmail({
			sender,
			to:reciever,
			subject:'Demo Reset Password',
			textContent:`http://localhost:3000/password/resetpassword/${uuidV4}`
		});
		res.json({message:'successfull'});
	}
	else{
		console.log("user does not exist");
		res.json({message:'failed'});
	}
}

exports.resetPassword=async(req,res,next)=>{
	const userUuid=req.params.uuid; 
	const passwordRequest=await ForgetPasswordRequest.findByPk(userUuid);
	if(passwordRequest.isactive){
		res.status(200).redirect('http://127.0.0.1:5500/updatepassword.html');
	}
	else{
		res.json({message:'failed'});
	}
}

exports.updatePassword=async(req,res,next)=>{
	const email=req.body.email;
	const newpassword=req.body.password;
	bcrypt.hash(newpassword,10,async(err,hash)=>{
		await User.update({password:hash},{where:{email:email}});
	})
	const user=await User.findOne({where:{email:req.body.email}});
	await forgetPasswordRequest.update({isactive:false},{where:{userId:user.id}});
	res.status(200).json({status:'success',message:'successfully updated'});
}