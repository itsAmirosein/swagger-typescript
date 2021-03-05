import { ResponsesType } from "./response";
import { Schemas } from "./schema";
import { normalizePath, getSchemaName } from "./util";
import { REF, parseObject, parseArray } from "./parse";
import { isObject, isArray, DataType } from "./dataType";

type MockData = {
  [path: string]: any;
};

// Compose mock data
export const composeMockData = (
  responses: ResponsesType,
  schemas: Schemas,
): MockData => {
  const ret: any = {};
  Object.keys(responses).forEach((path) => {
    const res = responses[path];
    const pathKey = normalizePath(path);
    let response: any = "";
    if (!res) {
      return;
    }
    const val =
      res["response"]?.["application/json"] ||
      res["response"]?.["application/octet-stream"] ||
      res["response"]?.["multipart/form-data"];

    if (!val) {
      return;
    }

    if (val.example) {
      response = val.example;
    } else if (val.examples) {
      const examplesKey = Object.keys(val.examples);
      if (examplesKey.length <= 1) {
        response = val.examples;
      } else {
        // for (const [key, example] of Object.entries<any>(val.examples)) {
        //   const extendedPathKey = pathKey + "_" + normalizeName(key);
        //   response = example["value"];
        // }
      }
    } else if ("schema" in val) {
      const { schema } = val;
      const ref = schema[REF];
      if (ref) {
        const schemaName = getSchemaName(ref);
        if (schemaName) {
          response = schemas[schemaName];
        }
      } else {
        if (isObject(schema)) {
          response = parseObject(schema, schemas);
        } else if (isArray(schema)) {
          response = parseArray(schema, schemas);
        } else if (schema.properties) {
          response = schema.properties;
        } else if (schema.type) {
          response = DataType.defaultValue(schema);
        }
      }
    }

    ret[pathKey] = {
      ...res,
      response,
    };
  });
  return ret;
};
