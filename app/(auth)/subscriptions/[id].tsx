import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, Link } from 'expo-router'
import { usePostHog } from 'posthog-react-native'

const SubscriptionDetails  = () =>
{
    const {id}=useLocalSearchParams<{id : string}>();
    const posthog = usePostHog();

    useEffect(() => {
        posthog.capture('subscription_detail_viewed', {
            subscription_id: id,
        });
    }, [id, posthog]);

    return (
        <View>
        <Text>SubscriptionDetails : {id}</Text>
        <Link href="/">Go Back</Link>
        </View>
    )
}

export default SubscriptionDetails