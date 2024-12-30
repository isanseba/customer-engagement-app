import React, { useState } from "react";
import { Table, Button, Pagination, Spinner } from "react-bootstrap";

const CustomTable = ({ data, columns, actions, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : data.length === 0 ? (
        <p className="text-center">No data available.</p>
      ) : (
        <>
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
              {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>{row[col.accessor]}</td>
                  ))}
                  {actions && (
                    <td>
                      <div className="d-flex gap-2">
                        {actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant={action.variant || "primary"}
                            size="sm"
                            onClick={() => action.onClick(row)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomTable;