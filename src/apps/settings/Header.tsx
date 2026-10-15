import React from 'react';
import CalculatorHeader from '../calculator/Header';
import { PhoneName } from '../../content/types';

type Props = { navigation: any; phone: PhoneName; title?: string };

/** Settings title bar: the shared plain app header, themed with the Settings colours. */
export default function Header({ navigation, phone, title }: Props) {
  return <CalculatorHeader navigation={navigation} phone={phone} app="settings" title={title} />;
}
