import React, { Component } from 'react'
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';

class TableFooterPagination extends Component {
  render() {
    const { totalEntries, page, pageSize, handleChangePage, handleChangeRowsPerPage } = this.props

    return(
      <TableFooter>
        <TableRow>
          <TablePagination
            count={totalEntries}
            onChangePage={(e, page) => handleChangePage(page + 1)}
            onChangeRowsPerPage={(e) => handleChangeRowsPerPage(e.target.value)}
            page={page - 1}
            rowsPerPage={pageSize}
          />
        </TableRow>
      </TableFooter>
    )
  }
}

export default TableFooterPagination
