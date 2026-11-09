package model

import (
	"github.com/perses/shared/cue/common"
)

kind: "PulzrFigurePanel"
spec: close({
	format?: common.#format
	// The figure's color, any CSS color.
	color?: string & !=""
	// What the period compared is called, after the change: "vs last week".
	comparedLabel?: string & !=""
	// Shown in place of the change when there is nothing to compare with.
	caption?: string & !=""
	// A fall is good news.
	lowerIsBetter?: bool
	// A time in parts, as people say it: 6h 46m.
	timeInParts?: bool
	// The figure, a rate, as a count of a total in the series named.
	of?: close({
		series: string & !=""
		label?: string
	})
	// A line under the title from the query's series: "of {{booked_space_hours}} booked hours".
	subtitle?: string & !=""
	// A small box under the figure, from the query's series.
	detail?: string & !=""
	// How the change reads: "↑ +0.7%" (signed) or "↑ 35.8%" (size).
	changeStyle?: "signed" | "size"
})
