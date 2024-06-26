const Expense=require('../model/expense');
const User=require('../model/user');
const sequelize=require('../util/database');

exports.addExpense=async(req,res,next)=>{
	const t=await sequelize.transaction();
	try{	
		const amount=req.body.amount;
		const description=req.body.description;
		const category=req.body.category;
		const user=await User.findByPk(req.user.id);
		const currentTotal=parseInt(await user.totalexpenses);
		const recentAmt=parseInt(amount);
		await Expense.create({amount:amount,description:description,category:category,userId:req.user.id},{transaction:t});
		await User.update({totalexpenses:currentTotal+recentAmt},{where:{id:req.user.id},transaction:t});
		await t.commit();
		res.status(200).json({success:true,message:"Expense added successfully"});
	}catch(err){
		await t.rollback();
		res.json({success:false,message:err});
	}
}

exports.getExpenses=async (req,res,next)=>{
	try{
	const expenses=await Expense.findAll({where:{userId:req.user.id}});
	const user=await User.findOne({where:{id:req.user.id}});
	const ispremium=user.ispremium;
	res.status(200).json({expenses,ispremium});
	}catch(err){
		console.log(err);
		res.json(err);}
}

exports.deleteExpense=async (req,res,next)=>{
	const t=await sequelize.transaction();
	try{ 
	const id=req.params.id;
	const user=await User.findByPk(req.user.id);
	const deletedExpense=await Expense.findOne({where:
	{id:id}});
	const newTotalExpenses=Number(user.totalexpenses)-Number(deletedExpense.amount);
	
	await Expense.destroy({where:{id:id,userId:req.user.id},transaction:t});
	await User.update({totalexpenses:newTotalExpenses},{where:{id:req.user.id},transaction:t});
	await t.commit();
	res.json({success:true,message:"deleted successfully"});
	}
	catch(err){
		await t.rollback();
		console.log(err);
	}
}