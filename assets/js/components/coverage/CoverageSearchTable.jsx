import React from "react";
import { Table, Select, Pagination } from "antd";
const { Option } = Select;
import { minWidth } from "../../util/constants";

export default ({
  hotspots,
  columns,
  handleChangePageSize,
  handleSortChange,
  handleChangePage,
  loading,
  rowSelection,
}) => {
  return (
    <React.Fragment>
      <Table
        sortDirections={["descend", "ascend", "descend"]}
        showSorterTooltip={false}
        rowKey={(record) => record.hotspot_address}
        dataSource={hotspots.entries}
        columns={columns}
        pagination={false}
        onChange={(pagi, filter, sorter) => {
          handleSortChange(
            sorter.field === "location" ? "long_city" : sorter.field,
            sorter.order === "descend" ? "desc" : "asc"
          );
        }}
        style={{ minWidth, overflowX: "scroll", overflowY: "hidden" }}
        className="no-scroll-bar"
        loading={loading}
        rowSelection={rowSelection}
      />
      <div
        style={{
          minWidth,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 0,
        }}
      >
        <Select
          value={`${hotspots.pageSize ? hotspots.pageSize : 0} results`}
          onSelect={handleChangePageSize}
          style={{ marginRight: 40, paddingTop: 2 }}
        >
          <Option value={10}>10</Option>
          <Option value={25}>25</Option>
        </Select>
        <Pagination
          current={hotspots.pageNumber}
          pageSize={hotspots.pageSize}
          total={hotspots.totalEntries}
          onChange={(page) => handleChangePage(page)}
          style={{ marginBottom: 20 }}
          showSizeChanger={false}
        />
      </div>
    </React.Fragment>
  );
};
