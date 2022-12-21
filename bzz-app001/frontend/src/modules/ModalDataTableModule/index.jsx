  import React, { useLayoutEffect } from "react";

import { useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";

import CrudDataTable from "./CrudDataTable";

export default function KPIDataTableModule({ config }) {


  return (
    // <FullPageLayout>
      // <WQTableLayout>
        <CrudDataTable config={config} />
      // </WQTableLayout>
    // </FullPageLayout>
  );
}
