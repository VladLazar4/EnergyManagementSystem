import React, { useState } from "react";

const ChatTable = ({ tableData, onRowClick }) => {
    const columns = [
        {
            Header: 'Admin Username',
            accessor: 'username', // Adjust accessor based on the actual property name
        },
        {
            Header: 'Role',
            accessor: 'role',
            visible: false, // Not visible in the table
        },
        {
            Header: 'ID',
            accessor: 'id',
            visible: false, // Not visible in the table
        }
    ];

    // Filter only users with admin roles
    const filteredData = tableData.filter(user => user.role === "admin");

    return (
        <div>
            <table className="table">
                <thead>
                <tr>
                    {columns.map(column => (
                        column.visible !== false && (
                            <th key={column.accessor}>{column.Header}</th>
                        )
                    ))}
                </tr>
                </thead>
                <tbody>
                {filteredData.length > 0 ? (
                    filteredData.map((row, index) => (
                        <tr
                            key={index}
                            onClick={() => onRowClick(row)} // Pass the row data to the click handler
                            style={{ cursor: 'pointer' }}
                        >
                            {columns.map(column => (
                                column.visible !== false && (
                                    <td key={column.accessor}>{row[column.accessor]}</td>
                                )
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan={columns.filter(col => col.visible !== false).length}
                            className="text-center"
                        >
                            No matching records found
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default ChatTable;
