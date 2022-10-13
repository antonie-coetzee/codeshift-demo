import { connector } from "@/lib/connector";
import * as React from "react";
import { utilsUsingRelativeImport } from "./util/relativeImport";

export const transistor = () => {
  return (
    <div>
      {connector}-transistor-{utilsUsingRelativeImport}
    </div>
  );
};
