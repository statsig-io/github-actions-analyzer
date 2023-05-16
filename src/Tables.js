import React from 'react';
import Table from './Table';

const Tables = ({ data }) => {
  const sumByDate = data.reduce((acc, { Date, Quantity }) => {
    if (Date == null || Date == "") {
      return acc;
    }
    if (!acc[Date]) {
      acc[Date] = 0;
    }
    acc[Date] += parseInt(Quantity);
    return acc;
  }, {});

  const sumByAction = data.reduce((acc, DataPoint) => {
    const possibleWorkflow = DataPoint["Actions Workflow"]
    if (possibleWorkflow == null  || possibleWorkflow === "") {
      return acc;
    }
    const workflow = possibleWorkflow.replace(".github/workflows/" , "");
    if (!acc[workflow]) {
      acc[workflow] = 0;
    }
    acc[workflow] += parseInt(DataPoint.Quantity);
    return acc;
  }, {});

  return (
    <div>
      <h2>Sum of Action Minutes by Date</h2>
      <Table data={sumByDate} headers={["Date", "Action Minutes"]} />
      <h2>Sum of Action Minutes by Action</h2>
      <Table data={sumByAction} headers={["Action", "Action Minutes"]} />
    </div>
  );
};

export default Tables;
