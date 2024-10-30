import React, { useState } from "react";

const columns = [
    {
        Header: 'Username',
        accessor: 'username',
    },
    {
        Header: 'Password',
        accessor: 'password',
    },
    {
        Header: 'Name',
        accessor: 'name',
    },
    {
        Header: 'Role',
        accessor: 'role',
    },
    {
        Header: 'User ID',
        accessor: 'id',
        visible: false
    }
];

function UserTable({ tableData, onRowClick }) {
    const [filterText, setFilterText] = useState('');

    const filteredData = tableData.filter(row =>
        row.name.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div>
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Filter by name"
                    className="form-control"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>

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
                        <tr key={index} onClick={() => onRowClick(row)} style={{ cursor: 'pointer' }}>
                            {columns.map(column => (
                                column.visible !== false && (
                                    <td key={column.accessor}>{row[column.accessor]}</td>
                                )
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.filter(col => col.visible !== false).length} className="text-center">
                            No matching records found
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default UserTable;
