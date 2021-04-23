import React from 'react';
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography;
import { useDispatch } from "react-redux";
import { deleteAlert } from '../../actions/alert';

export default ({ open, alert, close }) => {
  const dispatch = useDispatch();

  const handleSubmit = () => {
    dispatch(deleteAlert(alert.id)).then(_ => { close() });
  }

  return (
    <Modal
        title='Delete Alert'
        visible={open}
        onCancel={close}
        centered
        onOk={handleSubmit}
        footer={[
          <Button key="back" onClick={close}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Submit
          </Button>,
        ]}
      >
        {alert && 
          <div>
            <Text>Are you sure you want to delete the alert, <b>{alert.name}</b>?</Text>
          </div>
        }
      </Modal>
  );
}