import * as moment from 'moment'
import {print} from "util"

const appointmentTime = "2018-08-31T16:30:00+02:00"
const appointmentDate = "2018-09-03T16:30:00+02:00"

let parsedDate = moment.parseZone(appointmentDate)
let parsedTime = moment.parseZone(appointmentTime)

parsedDate.hour(parsedTime.hour())
parsedDate.minute(parsedTime.minute())


console.log(parsedDate.format("Do of MMMM"))