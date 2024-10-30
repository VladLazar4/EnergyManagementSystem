import React, {useState} from "react";
import Table from "../../commons/tables/table";  // Assuming this is the same Table component you're using for UserTable

const columns = [
    {
        Header: 'Device Name',
        accessor: 'name',
    },
    {
        Header: 'Device Description',
        accessor: 'description',
    },
    {
        Header: 'Device Address',
        accessor: 'address',
    },
    {
        Header: 'Device Max Hourly Consumption',
        accessor: 'maxHourlyConsumption',
    }
];

const filters = [
    {
        accessor: 'deviceName',
    }
];
function DeviceTable({ tableData, users = [], onRowClick }) {
    const [filterText, setFilterText] = useState('');

    const enrichedData = tableData.map(row => {
        const owner = users.find(user => user.id === row.ownerId);
        return {
            ...row,
            ownerUsername: owner ? owner.username : 'Unknown'
        };
    });

    const filteredData = enrichedData.filter(row =>
        row.name && row.name.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div>
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Filter by device name"
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

export default DeviceTable;