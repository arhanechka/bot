import { sm } from "jssm";
import textUtils from "./utils/textutils";
import axiousApi from "./services/axious-api";

import { Prompt } from "./services/prompt";
import { Data } from "./services/data";
import { StateService } from "./services/state";

import { StateTypes, States } from "./config/types";

const FSM = sm`
Welcome 'next' -> Authentication 'next' -> Menu;
Menu -> Weather -> City;
City -> Menu;
Menu <-> Name;
Menu <-> Colour;
Menu <-> Default;
Menu -> Goodbye;
`;

const states: States = {
  Welcome: {
    type: StateTypes.Question,
    text: () => textUtils.welcome,
    after: (state) => {
      Data.set("name", state.answer);
    },
  },
  Authentication: {
    type: StateTypes.Question,
    text: () =>
      `${textUtils.authentication} ${Data.get("name")}! ${textUtils.colour}`,
    after: (state) => {
      Data.set("colour", state.answer);
    },
  },
  Menu: {
    type: StateTypes.Question,
    text: () => {
      return textUtils.menu;
    },
    choices: ["Default", "City", ...textUtils.choices],
    after: (state) => {
      state.answer =
        state.answer.toLowerCase().charAt(0).toUpperCase() +
        state.answer.slice(1);
      if (!state.choices.includes(state.answer)) {
        Data.set("default", state.answer);
        state.answer = "Default";
      }
    },
  },
  Name: {
    type: StateTypes.Statement,
    next: "Menu",
    text: () => {
      const name = Data.get("name");
      return `Your name is ${name}, of course.`;
    },
  },
  Colour: {
    type: StateTypes.Statement,
    next: "Menu",
    text: () => {
      const colour = Data.get("colour");
      return `Your favourite colour is ${colour}, of course.`;
    },
  },
  Weather: {
    type: StateTypes.Question,
    next: "City",
    text: () => {
      return `What is your city?`;
    },
    after: (state) => {
      Data.set("city", state.answer);
    },
  },
  City: {
    type: StateTypes.Statement,
    next: "Menu",
    before: async () => {
      const city = Data.get("city");
      await axiousApi(city);
    },
    text: () => {
      const temperature = Data.get("temperature");
      const city = Data.get("city");
      return temperature
        ? `The weather for ${city} right now is ${temperature} celsius`
        : textUtils.weatherError;
    },
  },
  Default: {
    type: StateTypes.Statement,
    next: "Menu",
    text: () => {
      const googleSearchLink = new URL(
        `${textUtils.googleUrl}${Data.get("default")}`
      );
      return `${textUtils.unknownSearchResult}${googleSearchLink}. ${textUtils.searchSuggestion}${textUtils.choices}`;
    },
  },
  Goodbye: {
    type: StateTypes.Statement,
    text: () => textUtils.goodbye,
    after: () => {
      Prompt.close();
      process.exit();
    },
  },
};

const StateManager = new StateService(FSM, states);
