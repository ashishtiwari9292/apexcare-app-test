import React from 'react';
import { ComponentDivProps } from 'typings';
import Header from './Header';

const Layout = ({ children }: ComponentDivProps): JSX.Element => {
  return (
    <>
      <Header />
      <div>{children}</div>
      <br></br>
      <br></br>
      <br></br>
    </>
  );
};

export default Layout;
