import React from 'react';
import Table from './Table';

const Tables = ({ data, selectedView }) => {
  const [workflowFilters, setWorkflowFilters] = React.useState({
    repository: '',
    workflow: ''
  });

  // Helper function to get cost in dollars - use actual cost from CSV if available
  const getCostInDollars = (row) => {
    // If we have the actual cost from the CSV, use that
    if (row.gross_amount && parseFloat(row.gross_amount) > 0) {
      return parseFloat(row.gross_amount);
    }
    if (row.net_amount && parseFloat(row.net_amount) > 0) {
      return parseFloat(row.net_amount);
    }
    
    // Fallback to calculated cost
    const quantity = parseInt(row.quantity || 0);
    const costPerQuantity = parseFloat(row.applied_cost_per_quantity || 0.008);
    return (quantity * costPerQuantity).toFixed(2);
  };

  // Sum by date - handle both old and new column names
  const sumByDate = data.reduce((acc, row) => {
    const date = row.date || row.Date || row['Date'];
    const quantity = row.quantity || row.Quantity || row['Quantity'] || row['Minutes'] || row.minutes;
    
    if (date == null || date === "" || !quantity) {
      return acc;
    }
    
    if (!acc[date]) {
      acc[date] = { minutes: 0, cost: 0 };
    }
    
    const minutes = parseInt(quantity);
    const cost = parseFloat(getCostInDollars(row));
    
    acc[date].minutes += minutes;
    acc[date].cost += cost;
    return acc;
  }, {});

  // Sum by workflow - handle both old and new column names
  const sumByWorkflow = data.reduce((acc, row) => {
    // Try multiple possible column names for workflow path
    const workflow = row.workflow_path || row['Actions Workflow'] || row['Workflow'] || row['workflow'] || row['Workflow Name'] || row['workflow_name'] || row['Workflow Path'] || row['workflow_path'];
    const quantity = row.quantity || row.Quantity || row['Quantity'] || row['Minutes'] || row.minutes;
    const repository = row.repository || row['Repository'] || row['repository_name'];
    
    // Include rows even if quantity is 0, as long as there's a cost
    const cost = parseFloat(getCostInDollars(row));
    if (cost === 0 && (!quantity || quantity === "0")) {
      return acc;
    }
    
    let workflowKey;
    if (!workflow || workflow === "") {
      // For GitHub Actions usage data, use the runner type as the workflow identifier
      // This handles cases like actions_linux, actions_macos, actions_linux_2_core_arm
      const runnerType = row.sku || row['SKU'] || row['Runner Type'] || row['runner_type'] || row['Runner'] || row.runner;
      const actionType = row.action_type || row['Action Type'] || row['action_type'];
      
      if (runnerType && runnerType !== 'Unknown') {
        // Use runner type as workflow identifier
        workflowKey = `${runnerType} (${repository || 'Unknown Repo'})`;
      } else if (actionType && actionType !== 'Unknown') {
        // Fallback to action type
        workflowKey = `${actionType} (${repository || 'Unknown Repo'})`;
      } else {
        // Last resort - use SKU or product
        const sku = row.sku || row['SKU'] || 'Unknown';
        const product = row.product || row['Product'] || 'Unknown';
        const identifier = sku !== 'Unknown' ? sku : product;
        workflowKey = `${identifier} (${repository || 'Unknown Repo'})`;
      }
    } else {
      const cleanWorkflow = workflow.replace(".github/workflows/", "");
      workflowKey = `${cleanWorkflow} (${repository || 'Unknown Repo'})`;
    }
    
    if (!acc[workflowKey]) {
      acc[workflowKey] = { minutes: 0, cost: 0, repository: repository || 'Unknown Repo' };
    }
    
    const minutes = parseInt(quantity) || 0;
    
    acc[workflowKey].minutes += minutes;
    acc[workflowKey].cost += cost;
    return acc;
  }, {});

  // Sum by person/user - new for enterprise plan
  const sumByPerson = data.reduce((acc, row) => {
    const person = row.username || row['User'] || row['user'] || row['Person'] || row['person'] || row['Actor'] || row['actor'];
    const quantity = row.quantity || row.Quantity || row['Quantity'] || row['Minutes'] || row.minutes;
    
    // Skip rows where username is empty
    if (!person || person === "" || !quantity) {
      return acc;
    }
    
    if (!acc[person]) {
      acc[person] = { minutes: 0, cost: 0 };
    }
    
    const minutes = parseInt(quantity);
    const cost = parseFloat(getCostInDollars(row));
    
    acc[person].minutes += minutes;
    acc[person].cost += cost;
    return acc;
  }, {});

  // Sum by runner type - use SKU which has actual runner info
  const sumByRunnerType = data.reduce((acc, row) => {
    // For GitHub Actions usage data, the runner type is often in the second column
    // Try multiple possible column names in order of preference
    const runnerType = row.sku || row['SKU'] || row['Runner Type'] || row['runner_type'] || row['Runner'] || row.runner || row['Action Type'] || row['action_type'] || 'Unknown';
    const quantity = row.quantity || row.Quantity || row['Quantity'] || row['Minutes'] || row.minutes;
    
    if (!quantity) {
      return acc;
    }
    
    if (!acc[runnerType]) {
      acc[runnerType] = { minutes: 0, cost: 0 };
    }
    
    const minutes = parseInt(quantity);
    const cost = parseFloat(getCostInDollars(row));
    
    acc[runnerType].minutes += minutes;
    acc[runnerType].cost += cost;
    return acc;
  }, {});

  // Sum by repository - useful for enterprise users
  const sumByRepository = data.reduce((acc, row) => {
    const repository = row.repository || row['Repository'] || row['repository_name'];
    const quantity = row.quantity || row.Quantity || row['Quantity'] || row['Minutes'] || row.minutes;
    
    if (!repository || repository === "") {
      return acc;
    }
    
    // Include rows even if quantity is 0, as long as there's a cost
    const cost = parseFloat(getCostInDollars(row));
    if (cost === 0 && (!quantity || quantity === "0")) {
      return acc;
    }
    
    if (!acc[repository]) {
      acc[repository] = { minutes: 0, cost: 0 };
    }
    
    const minutes = parseInt(quantity) || 0;
    
    acc[repository].minutes += minutes;
    acc[repository].cost += cost;
    return acc;
  }, {});

  // Sum by action type - for GitHub Actions usage data
  const sumByActionType = data.reduce((acc, row) => {
    const actionType = row.action_type || row['Action Type'] || row['action_type'] || row['Actions'] || row['actions'];
    const quantity = row.quantity || row.Quantity || row['Quantity'] || row['Minutes'] || row.minutes;
    
    if (!actionType || actionType === "") {
      return acc;
    }
    
    if (!acc[actionType]) {
      acc[actionType] = { minutes: 0, cost: 0 };
    }
    
    const minutes = parseInt(quantity) || 0;
    const cost = parseFloat(getCostInDollars(row));
    
    acc[actionType].minutes += minutes;
    acc[actionType].cost += cost;
    return acc;
  }, {});

  // Debug: Log the first row to see available columns
  if (data && data.length > 0) {
    // Data is now working correctly - no debugging needed
  }

  // Convert data for display with separate columns
  const formatDataForTable = (dataObj) => {
    return Object.entries(dataObj).reduce((acc, [key, value]) => {
      acc[key] = [value.minutes, value.cost];
      return acc;
    }, {});
  };

  // Convert workflow data for display with repository column
  const formatWorkflowDataForTable = (workflowObj) => {
    return Object.entries(workflowObj).reduce((acc, [key, value]) => {
      // Extract workflow name and repository from the key
      const match = key.match(/^(.+?) \((.+)\)$/);
      const repository = match ? match[2] : 'Unknown';
      
      // Use the full key (workflow + repository) to avoid collapsing workflows with same name
      acc[key] = [repository, value.minutes, value.cost];
      return acc;
    }, {});
  };

  // Filter workflow data based on filters
  const getFilteredWorkflowData = () => {
    const workflowData = formatWorkflowDataForTable(sumByWorkflow);
    
    if (!workflowFilters.repository && !workflowFilters.workflow) {
      return workflowData;
    }
    
    const filteredData = Object.entries(workflowData).reduce((acc, [workflowName, values]) => {
      const [repository] = values;
      
      // Filter by repository
      if (workflowFilters.repository && !repository.toLowerCase().includes(workflowFilters.repository.toLowerCase())) {
        return acc;
      }
      
      // Filter by workflow name
      if (workflowFilters.workflow && !workflowName.toLowerCase().includes(workflowFilters.workflow.toLowerCase())) {
        return acc;
      }
      
      acc[workflowName] = values;
      return acc;
    }, {});
    
    return filteredData;
  };

  // Get unique repositories for filter dropdown
  const getUniqueRepositories = () => {
    const repos = new Set();
    Object.values(sumByWorkflow).forEach(item => {
      if (item.repository) {
        repos.add(item.repository);
      }
    });
    return Array.from(repos).sort();
  };

  const renderFilters = () => {
    if (selectedView === 'workflow') {
      return (
        <div style={{marginBottom: "20px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px"}}>
          <h3 style={{marginTop: "0", marginBottom: "15px"}}>Filters</h3>
          <div style={{display: "flex", gap: "20px", flexWrap: "wrap"}}>
            <div>
              <label htmlFor="repo-filter" style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>
                Repository:
              </label>
              <select
                id="repo-filter"
                value={workflowFilters.repository}
                onChange={(e) => setWorkflowFilters(prev => ({ ...prev, repository: e.target.value }))}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  minWidth: "200px"
                }}
              >
                <option value="">All Repositories</option>
                {getUniqueRepositories().map(repo => (
                  <option key={repo} value={repo}>{repo}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="workflow-filter" style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>
                Workflow Name:
              </label>
              <input
                id="workflow-filter"
                type="text"
                placeholder="Filter by workflow name..."
                value={workflowFilters.workflow}
                onChange={(e) => setWorkflowFilters(prev => ({ ...prev, workflow: e.target.value }))}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  minWidth: "200px"
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderSelectedTable = () => {
    switch (selectedView) {
      case 'date':
        return (
          <div>
            <h2>Usage by Date</h2>
            <Table 
              data={formatDataForTable(sumByDate)} 
              headers={["Date", "Minutes", "Cost ($)"]} 
              sortConfig={{ "Date": "string", "Minutes": "number", "Cost ($)": "number" }}
            />
          </div>
        );
      
      case 'workflow':
        return (
          <div>
            <h2>Usage by Workflow</h2>
            {renderFilters()}
            <Table 
              data={getFilteredWorkflowData()} 
              headers={["Workflow & Repository", "Repository", "Minutes", "Cost ($)"]} 
              sortConfig={{ "Workflow & Repository": "string", "Repository": "string", "Minutes": "number", "Cost ($)": "number" }}
            />
          </div>
        );
      
      case 'repository':
        return (
          <div>
            <h2>Usage by Repository</h2>
            <Table 
              data={formatDataForTable(sumByRepository)} 
              headers={["Repository", "Minutes", "Cost ($)"]} 
              sortConfig={{ "Repository": "string", "Minutes": "number", "Cost ($)": "number" }}
            />
          </div>
        );
      
      case 'person':
        return (
          <div>
            <h2>Usage by Person</h2>
            <Table 
              data={formatDataForTable(sumByPerson)} 
              headers={["Person", "Minutes", "Cost ($)"]} 
              sortConfig={{ "Person": "string", "Minutes": "number", "Cost ($)": "number" }}
            />
          </div>
        );
      
      case 'runner':
        return (
          <div>
            <h2>Usage by Runner Type</h2>
            <Table 
              data={formatDataForTable(sumByRunnerType)} 
              headers={["Runner Type", "Minutes", "Cost ($)"]} 
              sortConfig={{ "Runner Type": "string", "Minutes": "number", "Cost ($)": "number" }}
            />
          </div>
        );
      
      case 'actionType':
        return (
          <div>
            <h2>Usage by Action Type</h2>
            <Table 
              data={formatDataForTable(sumByActionType)} 
              headers={["Action Type", "Minutes", "Cost ($)"]} 
              sortConfig={{ "Action Type": "string", "Minutes": "number", "Cost ($)": "number" }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      {renderSelectedTable()}
    </div>
  );
};

export default Tables;
