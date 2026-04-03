import { View, Text } from 'react-native'
import {Link} from 'expo-router';

const sign_in = () => {
  return (
    <View>
      <Text>sign_in</Text>
      <Link href="/(auth)/Sign_up">Create Account</Link>
    </View>
  )
}

export default sign_in