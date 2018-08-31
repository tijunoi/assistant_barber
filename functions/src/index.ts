import * as functions from 'firebase-functions';
import * as moment from 'moment';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


const {
    dialogflow,
    BasicCard,
    Permission,
    NewSurface,
    NewSurfaceOptions,
    Suggestions
} = require('actions-on-google');
const timekit = require('timekit-sdk');
const app = dialogflow({debug: true});
timekit.configure({appKey: 'test_api_key_7WiCf8KasDE6TpNk0MtXCY8xfdABO2pb'})

app.intent('Default Welcome Intent', (conv) => {
    return conv.ask('Welcome to Barcelona Barber! What can I do for you?')
});


app.intent('Request an appointment', async (conv, {appointmentType, appointmentDate, appointmentTime}) => {

    console.log(appointmentDate)
    console.log(appointmentTime)
    if (conv.body.queryResult.allRequiredParamsPresent) {
        let parsedDate = moment.parseZone(appointmentDate)
        let parsedTime = moment.parseZone(appointmentTime)

        parsedDate.hour(parsedTime.hour())
        parsedDate.minute(parsedTime.minute())

        const endDate = parsedDate.clone().endOf('day')

        if (appointmentType.toLowerCase() === "haircut and beard") {
            const response = await timekit.fetchAvailability({
                mode: "roundrobin_random",
                resources: [
                    "72e24237-9992-4888-ad66-721e8d3d1f98",
                    "8563d819-2991-4f52-b2db-f450f143836f"
                ],
                length: "1 hours",
                from: parsedDate.format(),
                to: endDate.format(),
                timeslot_increments: "15 minutes",
                output_timezone: "Europe/Madrid"
            });

            const data: Array<any> = response.data;
            const startDate = moment.parseZone(data[0].start)

            return conv.ask(`<speak>There is an appointment available with ${response.data[0].resources[0].name} <say-as interpret-as="date" format="dm"> ${startDate.format("Do MMM")} </say-as> at <say-as interpret-as="time" format="hms12"> ${startDate.format("h:mma")} </say-as> Is that okay for you?</speak>`);
        } else if (appointmentType.toLowerCase() === "haircut") {
            return conv.close('Sorry, bookings for haircut are still not implemented. Please try again later');
        } else {
            return conv.close('Sorry, bookings for beard are still not implemented. Please try again later');
        }

    } else {

        conv.add(`The appointment type is: ${appointmentType} \n` +
            `The appointment date is: ${appointmentDate} \n ` +
            `The appointment time is: ${appointmentTime}`);

        if (!appointmentType) {
            const screenQuestion = conv.body.queryResult.fulfillmentText;
            if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
                return conv.ask(screenQuestion, new Suggestions(['Haircut', 'Beard', 'Haircut and beard']));
            } else {
                const speakerQuestion = `<speak><p>` + screenQuestion + `</p> <p>Haircut, beard service, or both</p></speak>`;
                return conv.ask(speakerQuestion);
            }
        } else if (!appointmentDate || !appointmentTime) {
            return conv.ask('Something is missing... tell me what is missing daddy')
        }


    }

    /*conv.add(`Here's your appointment`);
    conv.add(new BasicCard({
        title: `${appointmentType}`,
        text: `${appointmentDate} at ${appointmentTime}`
    }));
    return conv.ask(`Would you like to confirm it?`);*/
});

app.intent('Change surface test', (conv) => {
    const screenAvailable = conv.available.surfaces.capabilities.has('actions.capability.SCREEN_OUTPUT');

    const context = 'Sure, I will transfer myself to your phone';
    const notification = 'Yay! It works!';
    const capabilities = ['actions.capability.SCREEN_OUTPUT'];


    if (screenAvailable) {
        return conv.ask(new NewSurface({context, notification, capabilities}));
    } else {
        return conv.close("You don't have a screen device.");
    }

});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
