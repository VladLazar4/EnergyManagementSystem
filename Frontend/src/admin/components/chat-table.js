import React from "react";

const ChatTable = ({ tableData, onCheckboxChange, onSendMessage }) => {
    const columns = [
        { Header: 'Select', accessor: 'select' },
        { Header: 'Client Username', accessor: 'username' },
        { Header: 'Role', accessor: 'role', visible: false },
        { Header: 'ID', accessor: 'id', visible: false },
    ];

    const filteredData = tableData.filter(user => user.role === "client");

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
                            // onClick={() => onRowClick(row)} // Opens chat popup for the clicked user
                            style={{ cursor: 'pointer' }}
                        >
                            <td>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        e.stopPropagation(); // Prevent row click when toggling checkbox
                                        onCheckboxChange(row);
                                    }}
                                />
                            </td>
                            {columns.map(column => (
                                column.accessor !== 'select' && column.visible !== false && (
                                    <td key={column.accessor}>{row[column.accessor]}</td>
                                )
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan={columns.filter(col => col.visible !== false).length + 1}
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
