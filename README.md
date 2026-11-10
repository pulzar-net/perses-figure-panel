# Figure panel for Perses

`PulzrFigurePanel` draws one figure, large and light, and under it how it changed against the period before: `↓ -47.3% vs last week`, in the theme's success or error color. A dashboard's headline row: average occupancy, sessions, revenue.

```yaml
kind: Panel
spec:
  plugin:
    kind: PulzrFigurePanel
    spec:
      format: { unit: percent-decimal, decimalPlaces: 1 }
      color: '#10b981'
      comparedLabel: vs last week
      caption: Average for the selected week
```

- The figure is the last value of the first series that is not labelled `compare`, formatted by `format` (any Perses format).
- The period before is the last value of a series labelled `compare`. The [Pulzr Net](https://github.com/pulzar-net/perses-pulzr-datasource) and Parkeze datasources label the period they compare with this way, so one query asked to compare gives both.
- The change is in percent, flat within half a percent. A rise is drawn in the success color and a fall in the error color; `lowerIsBetter` swaps them. `comparedLabel` follows it.
- With nothing to compare with (no compared series, or zero before), `caption` shows instead, if set.
- `color` colors the figure; the theme's text color without it.
- `timeInParts` says a time as people do, `6h 46m` rather than `6.8h`, when `format` is in seconds, minutes or hours.
- `subtitle` is a line under the title and `detail` a small box under the figure, each filled from the query's series: `{{name}}` is that series' value, `{{name|%}}` the value as a percent. `of {{booked_space_hours}} booked hours, occupied`.
- `changeStyle: size` reads the change as its size, `↑ 35.8% vs previous period`: whole past 100%, `0%` within a twentieth of one, colored by good or bad news. The default, `signed`, is `↑ +0.7% vs last week`, flat within half a percent.
- `changeStyle: badge` puts the change small beside the figure, `↗ 133%`, sized as `size` and colored by good or bad news, with no compared label; the figure is bold, as on the console's Overview cards. `caption` shows under it when there is nothing to compare with.
- `sparkline: {series, color}` draws an area under the figure, 32px high, of every value over time of the series named (any query of the panel, for example one by day); `color` is the figure's unless set.
- `rows` lists figures under the figure, each a line: `label` on the left, on the right the last value of the series named `series`, formatted by its `format` (and `timeInParts`), and its change as a badge against that series' twin, `<series> · previous period` or `<series> · last year`, when there is one (`lowerIsBetter` per row).
- The figure is the first series that is neither the sparkline's nor a row's, and its period before is its own twin by name (`<figure> · previous period`), so one query can ask for several measures compared.
- `of: {series, label}` shows a rate as a count of a total beside it, `1690/2639 Spaces Occupied`: the total is the last value of the series named `series`, which the same query asks for (for example `measures: [peak_rate, spaces]`).

A pillar, as the Overview has them:

```yaml
spec:
  plugin:
    kind: PulzrFigurePanel
    spec:
      format: { unit: percent-decimal, decimalPlaces: 1 }
      color: '#10b981'
      changeStyle: badge
      sparkline: { series: Occupancy by day }
      rows:
        - { label: Sessions, series: Sessions, format: { unit: decimal, decimalPlaces: 0 } }
        - { label: Typical stay, series: Typical stay, format: { unit: minutes }, timeInParts: true }
        - { label: Turnover, series: Turnover, format: { unit: decimal, decimalPlaces: 1 } }
```

## Install

Put the archive (`PulzrFigurePanel-<version>.tar.gz`, from the releases) in a folder listed in the Perses server's `plugin.archive_paths`, or `npm install @pulzr/perses-figure-panel` to embed it.

## Development

```bash
npm install
npm test
percli plugin test-schemas
npm run build
percli plugin build
```

### Releasing

Set the new version in `package.json`, commit, then tag and push it:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

The Release workflow tests and builds, publishes the package to npm with provenance, and attaches the Perses plugin archive and the npm tarball to a GitHub release.

## License

Apache 2.0.
