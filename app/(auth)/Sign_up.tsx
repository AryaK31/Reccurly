import { View, Text } from 'react-native'
import {Link} from 'expo-router';

const sign_up = () => {
  return (
    <View>
      <Text>sign_up</Text>
      <Link href="/(auth)/Sign_up">Sign In</Link>
    </View>
  )
}

export default sign_up