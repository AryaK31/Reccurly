import { View, Text } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useEffect, useState } from 'react';
import { usePostHog } from 'posthog-react-native';
import { subscriptionApi } from '@/lib/api/subscriptions';
import { mapBackendSubscription } from '@/lib/subscriptionMapper';
import { formatCurrency, formatSubscriptionDateTime } from '@/lib/util';

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken } = useAuth();
  const posthog = usePostHog();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        const token = await getToken();
        if (!token) return;

        const response = await subscriptionApi.getById(token, id);
        const mappedSubscription = mapBackendSubscription(response.data);

        setSubscription(mappedSubscription);

        posthog.capture('subscription_details_viewed', {
          subscription_id: id,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription');
      }
    };

    loadSubscription();
  }, [id, getToken, posthog]);

  if (error) {
    return (
      <View>
        <Text>{error}</Text>
        <Link href="/">Go back</Link>
      </View>
    );
  }

  if (!subscription) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>{subscription.name}</Text>
      <Text>{formatCurrency(subscription.price, subscription.currency)}</Text>
      <Text>Status: {subscription.status}</Text>
      <Text>Billing: {subscription.billing}</Text>
      <Text>Payment: {subscription.paymentMethod}</Text>
      <Text>Renews: {formatSubscriptionDateTime(subscription.renewalDate)}</Text>

      <Link href="/">Go back</Link>
    </View>
  );
};

export default SubscriptionDetails;
