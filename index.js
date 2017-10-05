var restify = require('restify');
var builder = require('botbuilder');


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId:'9e2955e1-ec4f-4457-a075-a54c85be42d1',
    appPassword:'ec69nLCfm3xkpEHJQHV4KYa'
});


// Listen for messages from users
server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("welcome to Zygote HealthCare ");
        session.send("Not Feeling Well \n Need Medical Attention?!");


      //  builder.Prompts.choice(session, "Which color?", "red|green|blue", { listStyle: builder.ListStyle.button });
        session.beginDialog('getname');

    }

]);
bot.dialog('getname',[
  function(session){
    builder.Prompts.text(session, 'Hi! What is your name');
  },
  function(session,results){
    session.userData.name = results.response;
    session.endDialog(`hello ${session.userData.name}`);
    session.beginDialog('getGender');
  }
]);


bot.dialog('getGender', [
    function (session) {
        builder.Prompts.choice(session, "Please select your Gender","Female|Male", { listStyle: builder.ListStyle.button } );
    },
    function (session, results) {
          session.userData.gender = results.response.entity;
          session.endDialog(`your gender is ${results.response.entity}!`);
          session.beginDialog('askForInformation');


        }

]);

bot.dialog('askForInformation', [
    function (session) {
        builder.Prompts.choice(session, "please choose given information Are you!!","Adult|Child|Married",{ listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        if (results.response) {
            session.userData.Status = results.response.entity;
            session.send(`you selected ${results.response.entity}! from the list`);

        // session.beginDialog('askForPartySize1');
            session.beginDialog('askForAge');
              //session.beginDialog('disease');
            }
            else {
            session.send("OK");
        }
    }
]);
bot.dialog('askForAge', [
    function (session) {
        builder.Prompts.text(session, "enter your age");
    },
    function (session, results) {
      session.userData.age = results.response;

      session.send(`your age is  ${results.response}!`);
      session.endDialog(`you are quiet young  ${session.userData.name}!`);
        session.beginDialog('disease');
    }
])



bot.dialog('disease', [
    function (session) {
        builder.Prompts.text(session, "so tell me about your symptoms(for example 'i have fever,headache')" );
    },
    function (session, results) {
        if (results.response) {
            session.userData.problem = results.response;
            session.send(` I understand you having the following symptoms:  ${session.userData.problem}`);


        session.beginDialog('sym1');


            //session.beginDialog('askForPartySize11');
              //session.beginDialog('disease');







        } else {
            session.send("OK");
        }
    }
]);
bot.dialog('sym1',[
  function(session){
    builder.Prompts.choice(session, "how long you have it for!!","few hours|few days|few week|more than 3 months",{ listStyle: builder.ListStyle.button });
  },
  function(session,results){

    session.beginDialog('sym2');

  }
]);
bot.dialog('sym2',[
  function(session){
      builder.Prompts.choice(session, "Do you have any of symptoms today ?<br/>please enter number seperating by comma if you have all symptoms!!","1. Pain in one joint|2. single joint stiffness|3. muscle weakness|4. none of them",{ listStyle: builder.ListStyle.button });
  },
  function(session,results){

    session.beginDialog('sym3');

  }
]);

bot.dialog('sym3',[
  function(session){
      builder.Prompts.choice(session, "Do you have any of symptoms today ?<br/>please enter number seperating by comma if you have all symptoms!!","1. swelling of finger|2. swelling of hand|3. dry flaky scalp|4. none of them",{ listStyle: builder.ListStyle.button });
  },
  function(session,results){
    session.endDialog(` According to your symptoms you need to consult a doctor`);
      session.beginDialog('getdoctorlist');

  }
]);

bot.dialog('getdoctorlist',[
  function(session){
    session.send(` select the doctor you want to consult.`);
    builder.Prompts.choice(session,"avaliable doctor","Dr. shumbham jain|Dr. sandeep|Dr Amit|Dr lovely sharma",{ listStyle: builder.ListStyle.button });
  },
  function(session,results){
    session.userData.doctorname = results.response.entity;
    session.beginDialog('askForDateTime');

  }
]);








// The dialog stack is cleared and this dialog is invoked when the user enters 'help'.
bot.dialog('help', function (session, args, next) {
    session.endDialog("This is an virtual healtcare assistent bot . <br/>Please say 'next' to continue");
})
.triggerAction({
    matches: /^help$/i,
    onSelectAction: (session, args, next) => {
        // Add the help dialog to the dialog stack
        // (override the default behavior of replacing the stack)
        session.beginDialog(args.action, args);
    }
});

// Dialog to ask for a date and time
bot.dialog('askForDateTime', [
    function (session) {
        builder.Prompts.time(session, "Please provide a Appointment date and time (e.g.: June 6th at 5pm)");

    },
    function (session, results) {
      session.dialogData.appointmentdate =  builder.EntityRecognizer.resolveTime([results.response]);;
      session.send(`Appointment confirmed.<br/> Appointment details: <br/>Date/Time: ${session.dialogData.appointmentdate} <br/>Patient Name: ${session.userData.name} <br/>Patient Age: ${session.userData.age} <br/> Patient Gender: ${session.userData.gender} <br/> Patient Problem: ${session.userData.problem} <br/> Appointed Doctor: ${session.userData.doctorname}`);
      session.endDialog();
    }
]);
