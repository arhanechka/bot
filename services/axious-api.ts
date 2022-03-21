import axios, { AxiosRequestConfig } from "axios";
import { Data } from "./data";
import apiUtils from "../utils/apiUtils";

const headers = {
  "x-rapidapi-key": apiUtils.x_rapidapi_key,
  "x-rapidapi-host": apiUtils.x_rapidapi_host,
};

export default async (city) => {
  console.log(city);
  const options: AxiosRequestConfig = {
    method: "GET",
    url: apiUtils.url,
    params: {
      q: city,
      units: "metric",
    },
    headers: headers,
  };
  try {
    const response = await axios.request(options);
    Data.set("temperature", await response.data.main.temp);
    return response;
  } catch (err) {
    if (err?.response?.status === 404) {
      Data.set("temperature", undefined);
      return err;
    }
  }
};
