import React from 'react';
import Button from '@material-ui/core/Button';

const Trading = () => {
  return (
    <>
      <Button
        onClick={() => (window.location.href = 'https://bonfida.com/dex')}
        type="submit"
        color="primary"
        variant="outlined"
        style={{ marginRight: '8px', borderRadius: 0 }}
      >
        Trading
      </Button>
    </>
  );
};

export default Trading;
