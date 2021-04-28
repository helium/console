import React from 'react';
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography;
import { useDispatch } from "react-redux";
import { deleteMultiBuy } from '../../actions/multiBuy';

export default ({ open, selected, close }) => {
  const dispatch = useDispatch();

  const handleSubmit = () => {
    dispatch(deleteMultiBuy(selected.id)).then(() => { close() });
  }

  return (
    <Modal
        title='Delete Multiple Packet'
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
        {selected &&
          <div>
            <Text>Are you sure you want to delete <b>{selected.name}</b>?</Text>
          </div>
        }
      </Modal>
  );
}
