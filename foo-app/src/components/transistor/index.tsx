import * as React from "react";
import {connector} from "../../lib/connector"
import {utilsUsingRelativeImport} from "./util/relativeImport"

export const transistor = ()=>{
  return <div>{connector}-transistor-{utilsUsingRelativeImport}</div>
}