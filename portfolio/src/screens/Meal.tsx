import React, { useState } from 'react';
import { Switch } from 'react-native';
import {
  Screen,
  Stack,
  T,
  Card,
  Button,
  Field,
  Notice,
  Row,
  Pill,
  Tabs,
  useAction,
  palette,
} from '../components/ui';
import { api } from '../lib/api';
import { brand } from '../lib/config';
import { allergens, Patch, money, MealInput } from '../../shared/domain';
import { useFirstStepExperiment } from '../lib/experiment';
import { trackSdk } from '../lib/sdk';
export default function Meal() {
  const variant = useFirstStepExperiment(),
    [name, setName] = useState(''),
    [pantry, setPantry] = useState(''),
    [budget, setBudget] = useState('3'),
    [minutes, setMinutes] = useState('10'),
    [equipment, setEquipment] = useState<string[]>([]),
    [avoid, setAvoid] = useState<string[]>([]),
    [vegan, setVegan] = useState(false),
    [patches, setPatches] = useState<Patch[] | null>(null),
    [selected, setSelected] = useState<string[]>([]),
    [input, setInput] = useState<MealInput | null>(null),
    [saved, setSaved] = useState(false),
    a = useAction();
  const toggle = (values: string[], value: string, set: (v: string[]) => void) => {
    set(values.includes(value) ? values.filter((x) => x !== value) : [...values, value]);
    setPatches(null);
  };
  return (
    <Screen footer={<Tabs />}>
      <Stack>
        <Pill>ADD SOMETHING GOOD</Pill>
        <T kind="hero">A little more satisfying.</T>
        <T style={{ color: palette.muted }}>
          Start with your meal. Find a few simple things to add, at your pace and within your
          budget.
        </T>
        <Card style={{ backgroundColor: brand.color }}>
          <T style={{ fontSize: 20, lineHeight: 30 }}>
            More possibilities. No food scores. No calorie counting. Just your next meal.
          </T>
        </Card>
        <Card>
          <Stack>
            <Field
              label="What’s on your plate?"
              value={name}
              onChangeText={(v) => {
                setName(v);
                setPatches(null);
              }}
              placeholder="For example, tomato soup"
            />
            <Field
              label="What do you already have?"
              value={pantry}
              onChangeText={(v) => {
                setPantry(v);
                setPatches(null);
              }}
              placeholder="Cucumber, lemon, chickpeas…"
            />
            <Field
              label="Budget per addition · USD"
              value={budget}
              keyboardType="decimal-pad"
              onChangeText={(v) => {
                setBudget(v);
                setPatches(null);
              }}
            />
            <Field
              label="Minutes available"
              value={minutes}
              keyboardType="number-pad"
              onChangeText={(v) => {
                setMinutes(v);
                setPatches(null);
              }}
            />
            <T kind="label">EQUIPMENT YOU CAN USE</T>
            <Row style={{ flexWrap: 'wrap' }}>
              {['stove', 'microwave', 'toaster'].map((x) => (
                <Pill
                  key={x}
                  active={equipment.includes(x)}
                  onPress={() => toggle(equipment, x, setEquipment)}
                >
                  {x}
                </Pill>
              ))}
            </Row>
            <T kind="label">INGREDIENTS TO AVOID</T>
            <Row style={{ flexWrap: 'wrap' }}>
              {allergens.map((x) => (
                <Pill key={x} active={avoid.includes(x)} onPress={() => toggle(avoid, x, setAvoid)}>
                  {x}
                </Pill>
              ))}
            </Row>
            <Row>
              <Switch
                accessibilityLabel="Plant-based additions"
                value={vegan}
                onValueChange={(v) => {
                  setVegan(v);
                  setPatches(null);
                }}
              />
              <T>Plant-based additions</T>
            </Row>
            <T kind="caption">
              Always check labels and cross-contact warnings. Ingredient filters cannot guarantee an
              allergy-safe meal. Costs are estimates for one addition; buying every suggestion may
              exceed your total budget.
            </T>
            <Button
              title={variant === 'B' ? 'Find additions that fit →' : 'Find my meal patches →'}
              busy={a.busy}
              disabled={!name.trim()}
              onPress={() =>
                a.run(async () => {
                  const value = {
                    name,
                    pantry,
                    budgetCents: Math.round(Number(budget) * 100),
                    minutes: Number(minutes),
                    equipment,
                    avoid,
                    vegan,
                  };
                  const r = await api('/v1/meals/suggest', 'POST', value);
                  setInput(value);
                  setPatches(r.items);
                  setSelected(r.items.slice(0, 1).map((p: Patch) => p.id));
                  setSaved(false);
                })
              }
            />
          </Stack>
        </Card>
        {a.error ? <Notice error message={a.error} /> : null}
        {patches ? (
          <>
            <T kind="title">A few ways to make it yours</T>
            {!patches.length ? (
              <Notice message="No additions fit all these settings. You can try more time, a different budget, or equipment you have. Keep any needed allergy restrictions." />
            ) : (
              patches.map((p) => (
                <Card key={p.id}>
                  <Stack>
                    <Pill
                      active={selected.includes(p.id)}
                      onPress={() =>
                        setSelected(
                          selected.includes(p.id)
                            ? selected.filter((x) => x !== p.id)
                            : [...selected, p.id],
                        )
                      }
                    >
                      {selected.includes(p.id) ? 'Selected ✓' : 'Add to my meal'}
                    </Pill>
                    <T kind="title">{p.title}</T>
                    <T>{p.why}</T>
                    <T>{p.steps}</T>
                    <T kind="caption">
                      {p.ingredients.join(' · ')}
                      {p.allergens.length ? ' · Contains: ' + p.allergens.join(', ') : ''}
                    </T>
                    <T kind="caption">
                      {p.minutes} min · about {money(p.costCents)} per addition
                    </T>
                  </Stack>
                </Card>
              ))
            )}
            {patches.length ? (
              <Button
                title={saved ? 'Meal saved ✓' : 'Save this meal'}
                disabled={saved || !selected.length}
                busy={a.busy}
                onPress={() =>
                  a.run(async () => {
                    await api('/v1/meals', 'POST', { input, selected });
                    trackSdk('meal_saved');
                    setSaved(true);
                  })
                }
              />
            ) : null}
          </>
        ) : null}
      </Stack>
    </Screen>
  );
}
