import React from "react";
import styled from "styled-components";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import { useAuth0 } from "@auth0/auth0-react";
import StudentLoginButton from "./StudentLoginButton";
import { NavLink } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
const Header = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();

  return (
    <HeaderStyle>
      <CompanyName>BookNook</CompanyName>
      <QuickLinksDiv>
        <QuickLink to="/teacher">
          <LinkTitle>Dashboard</LinkTitle>
        </QuickLink>
        <QuickLink to="/libraries">
          <LinkTitle>Libraries</LinkTitle>
        </QuickLink>
        <QuickLink to="/classrooms">
          <LinkTitle>Classrooms</LinkTitle>
        </QuickLink>
        <QuickLink to="/checkout">
          <LinkTitle>Check Out Book</LinkTitle>
        </QuickLink>
        <QuickLink to="/return">
          <LinkTitle>Return</LinkTitle>
        </QuickLink>
      </QuickLinksDiv>
      <LoginContainer>
        {isAuthenticated ? (
          <>
            <CgProfileStyle />
            <LogoutButton />
            <div> Signed in as: {user.name ? user.name : user.email}</div>
          </>
        ) : (
          <>
            <LoginButton />

            <StudentLoginButton />
          </>
        )}
      </LoginContainer>
    </HeaderStyle>
  );
};

export default Header;

const HeaderStyle = styled.header`
  height: 120px;
  background-color: lightblue;
  position: relative;
`;

const CompanyName = styled.h1`
  margin: 0 auto;
`;

const QuickLinksDiv = styled.div`
  position: absolute;
  bottom: 0;
  left: 10vw;
  /* border: 1px solid red; */
  width: 65%;
  height: 25%;
  display: flex;
  justify-content: space-around;
`;

const QuickLink = styled(NavLink)`
  text-decoration: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-right: auto;
  /* border: 1px solid green; */
`;

const LinkTitle = styled.div`
  padding-bottom: 3px;
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  position: absolute;
  height: 80%;
  top: 50%;
  transform: translateY(-50%);
  right: 30px;
  margin: auto 0;
`;

const CgProfileStyle = styled(CgProfile)`
  font-size: 30px;
`;