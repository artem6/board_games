import { storageService } from "../../utils/storageService";

const dedupeKey = 'sequencingQuestionsAsked';

export const getQuestion = () => {
  const asked:number[] = storageService.get(dedupeKey) || [];

  let idx = 0;
  for (let i = 0; i < 1000; i++) {
    idx = Math.floor(Math.random() * questions.length);
    if (asked.indexOf(idx) !== -1) continue;
    storageService.set(dedupeKey, [...asked, idx], 24 * 60 * 60 * 1000);
    return questions[idx];
  }
  storageService.clear(dedupeKey);
  return questions[idx];
};

const questions = [
  `The number of times you had dairy last week`,
  `The number of times you had meat last week`,
  `The number of times you had fruits last week`,
  `The number of times you ate candy last week`,
  `The number of times you ate ice cream last week`,
  `The number of cars you've owned up to now`,
  `The number of cousins you have`,
  `The number of languages you can order food in`,
  `The cups of tea or coffee you drink every week`,
  `The number of phone contacts you have in your phone`,
  `The number of Facebook friends you have`,
  `The number of LinkedIn contacts you have`,
  `The number of times you wash towels per month`,
  `The number of times you vacuum per month`,
  `The length of your hand in centimeters from the top of your middle finger downwards`,
  `The number of songs you know most of the lyrics to`,
  `The number of pets you've owned up to now`,
  `The number of times you wash your hands every day`,
  `The number of TV series you're currently watching`,
  `The number of books you read per year`,
  `The number of hours you are listening to music every week`,
  `The number of hours you are watching TV / Netflix / streaming service of choice every week`,
  `The number of movies you watched last year`,
  `The number of messaging services you use on your phone (e.g. Whatsapp, Messenger)`,
  `The number of news apps you regularly use`,
  `The number of miles you drive per week`,
  `The number of continents you've ever traveled to`,
  `The number of countries you've ever traveled to`,
  `The number of cities you've ever traveled to`,
  `The number of US states you've ever traveled to`,
  `The age you were when you learned to drive`,
  `The number of times you've moved in the last 10 years`,
  `Your eyeglass prescription (0 if you don't need corrective lenses)`,
  `The age of your current phone in years`,
  `To the closest dollar, how much was your most recent online purchase`,
  `The number of servings of vegetables you had in the last week`,
  `The number of languages you can sing in`,
  `Of the place you lived at for the longest time, the number of years you lived there`,
  `The number of video calls you had in the last week`,
  `The number of phone calls you had in the last week`,
  `The number of seconds you can hold your breath for`,
  `The most number of miles you ran for in one run`,
  `In hours, the length of the longest hike you've gone on`,
  `The number of skin care products you use every night`,
  `In minutes, the average length of your showers`,
  `The number of hours you are on your phone every day`,
  `The number of times you bought something online in the last month`,
  `The last digit of your phone number`,
  `The sum of your birth date plus your birth month`,
  `The sum of the first two digits of your zip code`,
  `The number of video games you played in the last year`,
  `The number of this year's Oscar best picture nominees you've seen`,
  `The number of times you've used the oven in the last week`,
  `The number of times you've used the stovetop in the last week`,
  `The number of years of you took classes for any foreign languages`,
  `The number of times you wipe down your sink every month`,
  `The number of words you can type per minute`,
  `The number of words you can read per minute`,
  `The number of food items you're allergic to`,
  `The number of minutes you exercised last week`,
  `The number of sports you are reasonably confident in`,
  `The number of extracurricular clubs you were in during high school`,
  `The number of times you voted in the last 10 years`,
  `On a scale of 1 to 100, where 1 being most introverted, 100 being most extraverted, where are you`,
  `The number of times you went to a restaurant in the last year`,
];
