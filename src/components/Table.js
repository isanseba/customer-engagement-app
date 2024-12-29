import React from "react";
import { Table, Button } from "react-bootstrap";

const CustomTable = ({ data, columns, actions }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index}>{col.header}</th>
          ))}
          {actions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((col, colIndex) => (
              <td key={colIndex}>{row[col.accessor]}</td>
            ))}
            {actions && (
              <td>
                {actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant={action.variant || "primary"}
                    onClick={() => action.onClick(row)}
                  >
                    {action.label}
                  </Button>
                ))}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default CustomTable;
