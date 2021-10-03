const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");
const mongoose = require("mongoose");
const request = require("request");

const app = express()
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "this is a secret sentence i swear.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/bankDB", {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const accountSchema = new mongoose.Schema({
  name: String,
  accNo: Number,
  ifscCode: String,
  emailAdd: String,
  pass: String,
  accType: String,
  accBal: Number,
});

accountSchema.plugin(passportLocalMongoose);

const Account = mongoose.model("account", accountSchema);

// passport.use(Account.createStrategy());
// passport.serializeUser(function(acc, done){
//   done(null, acc.id);
// });
//
// passport.deserializeUser(function(id, done){
//   Account.findById(id, function(err, acc){
//     done(err, acc);
//   });
// });

const payeeSchema = new mongoose.Schema({
  payer: Number,
  accNum: Number,
  name: String,
  acc: accountSchema,
  accType: String,
  ifsc: String
});

const Payee = mongoose.model("payee", payeeSchema);

const loanSchema = new mongoose.Schema({
  loanType: String,
  accNo: Number,
  loanAm: Number,
  itst: Number,
  date: {type: Date, default: Date.now},
  remAmm: Number
});


const Loan = mongoose.model("loan", loanSchema);

const payeeTransSchema = new mongoose.Schema({
  payer: Number,
  payeeAcc: Number,
  amount: Number,
  date: Date
});

const PayeeTrans = mongoose.model("payeeTrans", payeeTransSchema);

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

adminSchema.plugin(passportLocalMongoose);

const Admin = mongoose.model("admin", adminSchema);

passport.use("admin", Admin.createStrategy());

passport.serializeUser(function(admin, done){
  done(null, admin.id);
});

passport.deserializeUser(function(id, done){
  Admin.findById(id, function(err, admin){
    done(err, admin);
  });
});

const loanTransSchema = new mongoose.Schema({
  accs: Number,
  loanId: loanSchema,
  amount: Number,
  transDate: Date,
});

const LoanTrans = mongoose.model("loanTransaction", loanTransSchema);

app.get("/newAdmin", function(req, res){
  res.render("newAdmin");
});

app.post("/newAdmin", function(req, res){
  const newAdmin = {
    username: req.body.username,
  };
  Admin.register(newAdmin, req.body.password, function(err, user){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("admin")(req, res, function(){
        console.log("registered the admin");
      });
    }
  });
  res.redirect("/loginAdmin");
});

app.get("/loginAdmin", function(req, res){
  res.render("loginAdmin");
});

app.post("/loginAdmin", function(req, res){

  const newAdmin = new Admin({
    username: req.body.username,
    password: req.body.password
  });

  console.log("A person is trying to login");
  req.login(newAdmin, function(err){
    if(err){
      console.log(err);
      res.redirect("/loginAdmin");
    }
    else{
      console.log("Logged in");
      passport.authenticate("admin")(req, res, function(){
        console.log("Authenticated");
        res.redirect("/adminAdd");
      });
    }
  });
});

app.get("/adminAdd", function(req, res){
  console.log(req.isAuthenticated());
  console.log(req.sessionID);
  if(req.isAuthenticated()){
    res.render("adminAdd");
  }
  else{
    res.redirect("/loginAdmin");
  }
});

app.post("/adminAdd", function(req, res){
  console.log(req.body);
  console.log("hello");
  Account.find({accNo: req.body.accNo}, function(err, account){
    if(err){
      console.log(err);
    }
    else{
      console.log("The execution is here");
      console.log(account);
      console.log(account.length);
      const newAcc = {
        name: req.body.addFName,
        accNo: req.body.addAccNo,
        ifscCode: req.body.addIfscCode,
        emailAdd: req.body.addEmailAdd,
        accType: req.body.addAccType,
        accBal: req.body.addAccBal,
        username: req.body.addEmailAdd
      };
      if(account.length == 0){
        Account.register(newAcc, req.body.addPass, function(err, user){
          if(err){
            console.log(err);
            res.redirect("/adminAdd");
          }else{
            // passport.authenticate("local")(req, res, function(){
            //   res.redirect("/adminAdd");
            // });
            res.redirect("/adminAdd");
          }
        });
        console.log("The account is added to the database");
      }
      else{
        console.log("There already exists an account with that number");
        res.redirect("/adminAdd");
      }
    }
  });
});

app.get("/adminDelete", function(req, res){
  if(req.isAuthenticated()){
    console.log(req.admin);
    res.render("adminDelete");
  }
  else{
    res.redirect("/loginAdmin");
  }
});

app.post("/adminDelete", function(req, res){
  console.log(req.body);
  const newAcc = new Account({
    accNo: req.body.delAccNo,
    emailAdd: req.body.delEmailAcc,
    password: req.body.delPassword,
    username: req.body.delEmailAcc
  });

  req.login(newAcc, function(err){
    if(err){
      console.log(err);
      res.redirect("/adminDelete");
    }
    else{
      Account.deleteOne({accNo: req.body.delAccNo}, function(err){
        if(err){
          console.log("There is an error while deleting the account that you requested");
          console.log(err);
        }
        else{
          console.log("The account that you requested is deleted.")
        }
      });
      res.redirect("/adminDelete");
    }
  });
});

app.get("/adminDepositMoney", function(req, res){
  if(req.isAuthenticated()){
    res.render("adminDepositMoney");
  }
  else{
    res.redirect("/loginAdmin");
  }
});

app.post("/adminDepositMoney", function(req, res){
  console.log(req.body);
  Account.find({accNo: req.body.dpAccNo, ifscCode: req.body.dpIfscCode}, function(err, accounts){
    if(err){
      console.log("There is an error while depositing the money");
    }
    else{
      if(accounts.length == 0){
        console.log("There weren't any accounts that matched the description");
      }
      else{
        if(accounts.length > 1){
          console.log("More than one account got matched, what the hell");
        }
        else{
          console.log(accounts);

          let finDp = Number(accounts[0].accBal);
          finDp += Number(req.body.dpAmount);
          console.log(finDp);
          Account.updateOne({accNo: req.body.dpAccNo, ifscCode: req.body.dpIfscCode}, {accBal: finDp}, function(err){});
          console.log("Account got updated");

        }
      }
    }
  });
  res.render("adminDepositMoney");
});


app.get("/adminGrantLoan", function(req, res){
  if(req.isAuthenticated()){
    res.render("adminGrantLoan");
  }
  else{
    res.redirect("/loginAdmin");
  }
});

app.post("/adminGrantLoan", function(req, res){
  console.log(req.body);
  Account.find({accNo: req.body.gtAccNo}, function(err, account){
    if(err){
      console.log("There was an error while granting a loan");
    }
    else{
      if(account[0].accBal > 0.1*req.body.gtLoanAmm || account[0].accBal > req.body.gtLoanAmm){
        const newLoan = new Loan({
          loanType: req.body.gtLoanType,
          accNo: req.body.gtAccNo,
          loanAm: req.body.gtLoanAmm,
          itst: req.body.gtLoanPt,
          remAmm: req.body.gtLoanAmm
        });

        newLoan.save();
        console.log("Got updated");

        console.log("Granted the required loan");
      }
      console.log(account);
    }
  })
  res.redirect("/adminGrantLoan");
});

app.get("/adminView", function(req, res){
  if(req.isAuthenticated()){
    res.render("adminView", {allAccsEjs: []});
  }
  else{
    res.redirect("/loginAdmin");
  }
});

app.post("/adminView", function(req, res){
  console.log(req.body);
  let allAccs = [];
  Account.find({accNo: req.body.accno},"accNo name accBal",function(err, accounts){
    if(accounts.length === 0){
      console.log("There are no accounts to show for the given account number");
      res.render("adminView", {allAccsEjs: []});
    }
    else{
      for(let i = 0; i<accounts.length; i++){
        allAccs.push(accounts[i]);
      }
      console.log(allAccs);
      res.render("adminView", {allAccsEjs: allAccs});
    }
  });
});

app.get("/adminViewLoans", function(req, res){
  if(req.isAuthenticated()){
    res.render("adminViewLoans", {allLoansEjs: []});
  }
  else{
    res.redirect("/loginAdmin");
  }
});

app.post("/adminViewLoans", function(req, res){
  console.log(req.body);
  let allLoans = [];
  Loan.find({accNo: req.body.accno},"loanType accNo loanAm itst remAmm date",function(err, loans){
    if(loans.length === 0){
      console.log("There are no loans to show for the given account number");
      res.render("adminViewLoans", {allLoansEjs: []});
    }
    else{
      for(let i = 0; i<loans.length; i++){
        allLoans.push(loans[i]);
      }
      console.log(allLoans);
      res.render("adminViewLoans", {allLoansEjs: allLoans});
    }
  });
});

app.get("/adminWithdraw", function(req, res){
  if(req.isAuthenticated()){
    res.render("adminWithdraw");
  }
  else{
    res.redirect("/loginAdmin");
  }
});

app.post("/adminWithdraw", function(req, res){
  console.log(req.body);
  Account.find({accNo: req.body.dpAccNo, ifscCode: req.body.dpIfscCode}, function(err, accounts){
    if(err){
      console.log("There is an error while depositing the money");
    }
    else{
      if(accounts.length == 0){
        console.log("There weren't any accounts that matched the description");
      }
      else{
        if(accounts.length > 1){
          console.log("More than one account got matched, what the hell");
        }
        else{
          console.log(accounts);

          let finDp = Number(accounts[0].accBal);
          finDp -= Number(req.body.dpAmount);
          if(finDp > 0){
            console.log(finDp);
            Account.updateOne({accNo: req.body.dpAccNo, ifscCode: req.body.dpIfscCode}, {accBal: finDp}, function(err){});
            console.log("Account got updated");
          }
          else{
            console.log("The withdrawal process can't be done, you don't have enough money bruh.");
          }
        }
      }
    }
  });
  res.redirect("/adminWithdraw");
});

app.get("/", function(req, res){
  res.render("loginCustomer");
});

let currentUser = {};

app.post("/", function(req, res){


  console.log(req.body);
  currentUser.username = req.body.username;
  currentUser.password = req.body.password;
  currentUser = Account.authenticate()(req.body.username, req.body.password, function(err, thisModel, passwordErr){
    if(err){
      console.log(err);
    }
  });
  if(currentUser != {}){
    currentUser = req.body;
    res.redirect("/customerAccount");
  }
  else{
    console.log("Such an account doesn't exist");
  }
});

app.get("/customerAccount", function(req, res){
  console.log("req username", currentUser.username);
  Account.findOne({emailAdd: currentUser.username}, function(err, acc){
    if(err){
      console.log("Error while logging in a customer: ", err);
    }
    else{
      console.log("customerAccount", acc);
      const accDeets = {
        name: acc.name,
        accNo: acc.accNo,
        ifscCode: acc.ifscCode,
        emailAdd: acc.emailAdd,
        accType: acc.accType,
        accBal: acc.accBal,
      };
      res.render("customerAccount", accDeets);
    }
  });
});

app.get("/customerLoanInfo", function(req, res){
  console.log("customerLoanInfo", currentUser);
  Account.findOne({emailAdd: currentUser.username}, function(err, acc){
    if(err){
      console.log("Finding the account error", err);
    }else{
      Loan.find({accNo: acc.accNo}, function(err, loans){
        if(err){
          console.log("Error while accessing the loans database :: ", err);
        }
        else{
          console.log("loans", loans);
          res.render("customerLoanInfo", {allLoansEjs: loans});
        }
      });
    }
  });
});

app.get("/customerTransactions", function(req, res){
  Account.findOne({emailAdd: currentUser.username}, function(err, acc){
    PayeeTrans.find({payer: acc.accNo}, function(err, transactions){
      if(err){
        console.log("Finding the account ERROR", err);
      }
      else{
        console.log("transactions", transactions);
        res.render("customerTransactions", {allTransEjs: transactions});
      }
    });
  });
});

app.get("/customerLoanTransactions", function(req, res){
  Account.findOne({emailAdd: currentUser.username}, function(err, acc){
    if(err){
      console.log("Finding the account ERROR", err);
    }
    else{
      LoanTrans.find({accs: Number(acc.accNo)}, function(err, loans){
        console.log(loans);
        res.render("customerLoanTransactions", {allLoansEjs: loans});
      });
    }
  });
});

app.get("/customerPayee", function(req, res){
  res.render("customerPayee");
});

app.post("/customerPayee", function(req, res){
  Account.findOne({username: currentUser.username}, function(err, acc){
    const newPayee = new Payee({
      payer: Number(acc.accNo),
      accNum: req.body.accNo,
      name: req.body.name,
      acc: acc,
      accType: req.body.acctype,
      ifsc: req.body.ifsc
    });
    newPayee.save();
    Account.findOne({accNo: req.body.accNo}, function(err, accs){
      if(err){
        console.log("ERROR in finding payees");
        res.render("customerPayee");
      }
      else{
        res.redirect("/customerTransferAmount");
      }
    });
  });
});

app.get("/customerPayLoans", function(req, res){
  res.render("customerPayLoans");
});

app.post("/customerPayLoans", function(req, res){
  Account.findOne({emailAdd: currentUser.username}, function(err, acc){
    if(err){
      console.log("Finding the account error", err);
    }else{
      Loan.findOne({accNo: acc.accNo, loanType: req.body.loantype}, function(err, loan){
        if(err){
          console.log("Error while accessing the loans database :: ", err);
        }
        else{
          if(acc.accBal < req.body.amount){
            console.log("Balance won't suffice");
          }
          else{
            let remBal = acc.accBal - req.body.amount;
            Account.updateOne({emailAdd: currentUser.username}, {accBal: remBal}, function(err){
              if(err){console.log("Updating the account ERROR", err);}
            })

            let remLoanAmm = Number(loan.remAmm) - req.body.amount;
            Loan.updateOne({accNo: Number(acc.accNo)}, {remAmm: remLoanAmm}, function(err){
              if(err){console.log("Updating the loans ERROR", err);}
            })

            const newTrans = new LoanTrans({
              accs: Number(acc.accNo),
              loanId: loan,
              amount: req.body.amount,
              transDate: Date.now()
            });

            newTrans.save();
            console.log("loans", loan);

            res.redirect("/customerLoanTransactions");
          }
        }
      });
    }
  });
});

app.get("/customerRemovePayee", function(req, res){
  res.render("customerRemovePayee");
});

app.post("/customerRemovePayee", function(req, res){
  Payee.deleteOne({accNum: req.body.accnum}, function(err){})
  res.redirect("/customerAccount");
});

app.get("/customerTransferAmount", function(req, res){
  res.render("customerTransferAmount");
});

app.post("/customerTransferAmount", function(req, res){
  Account.findOne({username: currentUser.username}, function(err, acc){
    console.log(acc);
    Payee.findOne({payer: Number(acc.accNo), accNum: req.body.sendAcc}, function(err, payee){
      if(acc.accBal > req.body.amt){
        Account.updateOne({username: currentUser.username}, {accBal:(acc.accBal - req.body.amt)}, function(err){});
        Account.updateOne({accNo: req.body.sendAcc}, {accBal:(Number(payee.accBal) + Number(req.body.amt))}, function(err){});

        const anotherTrans = new PayeeTrans({
          payer: Number(acc.accNo),
          payeeAcc: Number(payee.accNum),
          amount: req.body.amt,
          date: Date.now()
        });
        anotherTrans.save();

        res.redirect("/customerTransactions");
      }
      else{
        console.log("There is not enough balance");
      }
    });
  });
});

app.get("/customerLogout", function(req, res){
  currentUser = {};
  res.render("logout");
})

app.get("/logout", function(req, res){
  req.logout();
  res.render("logout");
});

app.get("/chat", function(req, res){
  dict = {data: "nothing"};
  res.render("chat", {dict: dict});
});

var i = 0;
app.post("/chat", function(req, res){
  request.post({url:'http://127.0.0.1:5000/', form: {msg: req.body.msg}}, function(err,httpResponse,reply){
    console.log(reply);
    dict["data"] = reply;
    console.log(dict);
    res.render("chat", {dict: dict});
  });

  // const { spawn } = require('child_process');
  // var dataToSend = "";
  // // spawn new child process to call the python script
  //
  // const python = spawn('python', ['chatbotModel/main.py', req.body.msg]);
  // console.log(req.body.msg);
  // dict = {}
  // // collect data from script
  // python.stdout.on('data', function (data) {
  //   console.log('Pipe data from python script ...');
  //   dataToSend = data.toString();
  //   console.log(dataToSend);
  //   dict["data"] = dataToSend;
  // });
  //
  // // in close event we are sure that stream from child process is closed
  //
  //
  // python.on('close', (code) => {
  //   dict = {}
  //   console.log(`child process close all stdio with code ${code}`);
  //   // send data to browser
  //   console.log(dataToSend);
  //   dict["data"] = dataToSend;
  //   console.log(dict);
  //   res.render("chat", {dict: dict});
  // });

});

var usrMsg = [];
var srvMsg = [];

app.get('/chatbox', function(req, res){
  dict = {userMsgs: usrMsg, serverMsgs: srvMsg};
  res.render("chatbox", dict);
});

app.post('/chatbox', function(req, res){

  var dataToSend;
  // spawn new child process to call the python script
  // const { spawn } = require('child_process');
  // const python = spawn('python', ['main.py', req.body.msg]);
  // collect data from script
  console.log("Message" ,req.body.msg);
  usrMsg.push(req.body.msg);
  // python.stdout.on('data', function (data) {
  //   console.log('Pipe data from python script ...');
  //   dataToSend = data.toString();
  //   srvMsg.push(dataToSend);
  // });
  //
  // // in close event we are sure that stream from child process is closed
  // python.on('close', (code) => {
  //   console.log(`child process close all stdio with code ${code}`);
  //   // send data to browser
  //   console.log("Data to Send", dataToSend);
  //   // if(dataToSend.slice(0,4) == "http"){
  //     // dict = {userMsgs: usrMsg, serverMsgs: srvMsg};
  //     // res.render("<script>window.top.location.href = '/customerAccount';</script> ")
  //   // }
  //   // else{
  //     dict = {userMsgs: usrMsg, serverMsgs: srvMsg};
  //     console.log(dict);
  //     res.render("chatbox", dict);
  //   // }
  // });

  request.post({url:'http://127.0.0.1:5000/', form: {msg: req.body.msg}}, function(err,httpResponse,reply){
    console.log(reply);
    srvMsg.push(reply);
    dict = {userMsgs: usrMsg, serverMsgs: srvMsg};
    console.log(usrMsg);
    console.log(srvMsg);
    res.render("chatbox", dict);
  });
});

app.get('/chatboxTransferMoney', function(req, res){
  dict = {userMsgs: usrMsg, serverMsgs: srvMsg};
  res.render("chatbox", dict);
});

app.post('/chatboxTransferMoney', function(req, res){
  dict = {userMsgs: usrMsg, serverMsgs: srvMsg};
  Account.findOne({username: currentUser.username}, function(err, acc){
    console.log(acc);
    Payee.findOne({payer: Number(acc.accNo), accNum: req.body.sendAcc}, function(err, payee){
      if(acc.accBal > req.body.amt){
        Account.updateOne({username: currentUser.username}, {accBal:(acc.accBal - req.body.amt)}, function(err){});
        Account.updateOne({accNo: req.body.sendAcc}, {accBal:(Number(payee.accBal) + Number(req.body.amt))}, function(err){});

        const anotherTrans = new PayeeTrans({
          payer: Number(acc.accNo),
          payeeAcc: Number(payee.accNum),
          amount: req.body.amt,
          date: Date.now()
        });
        anotherTrans.save();
        srvMsg.pop();
        srvMsg.push("The Amount has been Successfully transferred");
        console.log(srvMsg);
        res.redirect("/chatbox");
      }
      else{
        console.log("There is not enough balance");
        srvMsg.pop();
        srvMsg.push("There is not enough balance in your account to support the transaction");
        res.redirect("/chatbox");
      }
    });
  });
});

app.post("/chatboxPayLoans", function(req, res){
  Account.findOne({emailAdd: currentUser.username}, function(err, acc){
    if(err){
      console.log("Finding the account error", err);
    }else{
      Loan.findOne({accNo: acc.accNo, loanType: req.body.loantype}, function(err, loan){
        if(err){
          console.log("Error while accessing the loans database :: ", err);
        }
        else{
          if(acc.accBal < req.body.amount){
            console.log("Balance won't suffice");
          }
          else{
            let remBal = acc.accBal - req.body.amount;
            Account.updateOne({emailAdd: currentUser.username}, {accBal: remBal}, function(err){
              if(err){console.log("Updating the account ERROR", err);}
            })

            let remLoanAmm = Number(loan.remAmm) - req.body.amount;
            Loan.updateOne({accNo: Number(acc.accNo)}, {remAmm: remLoanAmm}, function(err){
              if(err){console.log("Updating the loans ERROR", err);}
            })

            const newTrans = new LoanTrans({
              accs: Number(acc.accNo),
              loanId: loan,
              amount: req.body.amount,
              transDate: Date.now()
            });

            newTrans.save();
            console.log("loans", loan);
            srvMsg.pop();
            srvMsg.push("The amount has been Successfully paid.");
            res.redirect("/chatbox");
          }
        }
      });
    }
  });
});

app.post("/chatboxRegisterPayee", function(req, res){
  Account.findOne({username: currentUser.username}, function(err, acc){
    const newPayee = new Payee({
      payer: Number(acc.accNo),
      accNum: req.body.accNo,
      name: req.body.name,
      acc: acc,
      accType: req.body.acctype,
      ifsc: req.body.ifsc
    });
    newPayee.save();
    Account.findOne({accNo: req.body.accNo}, function(err, accs){
      if(err){
        console.log("ERROR in finding payees");
        res.render("customerPayee");
      }
      else{
        srvMsg.pop();
        srvMsg.push("The payee has been succesfully registered with your account.");
        res.redirect("/chatbox");
      }
    });
  });
});

app.post("/chatboxRemovePayee", function(req, res){
  Payee.deleteOne({accNum: req.body.accnum}, function(err){
    if(err){
      console.log("Error occured while removing a payee: ", err);
    }
    else{
      srvMsg.pop();
      srvMsg.push("The payee has been succesfully removed");
      res.redirect("/chatbox");
    }
  });
});

app.listen(3000, function(req, res){
  console.log("Successfully connected to the server!");
});
