import PasswordResetForm from "@components/ForgotPassword/PasswordResetForm";
import { Container, Flex, Title } from "@mantine/core";

const ResetPassword = () => {
  return (
    <Container h="100vh">
      <Flex direction="column" justify="center" align="center" h="100%" gap={8}>
        <Flex direction="column" justify="center" align="center" maw={512} w="100%" gap={16}>
          <Title>Reset Password</Title>
          <PasswordResetForm />
        </Flex>
      </Flex>
    </Container>
  );
};

export default ResetPassword;
