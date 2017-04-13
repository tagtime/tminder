const GAP = 3/4  // TagTime's frequency is 3/4 hours

let TID = null   // Timer ID for interval timer, for refreshing every second

// Given number of emergency pings and time to deadline in seconds, return
// the probability of getting at least that many pings in that much time
function pingprob(ep, td) { return GammaCDF(td/3600, ep, GAP) }

// Singular or Plural: Pluralize the given noun properly, if n is not 1. 
// Provide the plural version if irregular.
// Eg: splur(3, "boy") -> "3 boys", splur(3, "man", "men") -> "3 men"
function splur(n, noun, nounp='') {
  if (nounp === '') { nounp = noun+'s' }
  return n.toString()+' '+(n === 1 ? noun : nounp)
}
  
// Show number (just rounds to some number of places for now)
function shn(x, d=6) {
  if (typeof x != 'number') { return x }
  return Math.round(x*Math.pow(10,d))/Math.pow(10,d) + ""
}

// Show probability as a percentage
function shp(p) { return isNaN(p) || p<0 || p>1 ? '??%' : shn(p*100, 9) + '%' }

// Given eep hours and eep pings, return the string that comes after the 
// "hours needed" field in the UI.
function sheep(eh, ep) { // "sheep" = "show eep hours/pings"
  let digs = x => { // This is ugly and shn() should handle this stuff
    if      (x>=1)      { return 2 } 
    else if (x>17/3600) { return 2 } 
    else if (x>1/3600)  { return 3 }
    else                { return 6 }
  }
  let seh = isnum(eh) ? shn(eh, digs(eh)) : '??'
  let sep = isnum(ep) ? ep                : '??'
  return `${seh}h ⇒ ${splur(sep, 'ping')}`
}

// Given deadline and time to deadline, return the string that comes after the
// deadline field in the UI. "time-of-day (+countdown)".
function shead(dl, td) { // "shead" = "show deadline"
  if (dl<0 && td<0 || !isnum(dl) || !isnum(td)) { return '??:?? (+??h)' }
  if (dl<0) { dl = teatime(td) }
  if (td<0) { td = pumpkin(dl) }
  return `${genTOD(dl)} (+${genHMS(td)})`
}

// Given number of eep pings, deadline, and time to deadline, return the string
// that comes after the percent probability number in the UI
function shpost(ep, dl, td) { // "shpost" = "show post-probability stuff"
  let pre = `probability of ${isnum(ep) ? ep : '??'}+ pings `
  return dl<0 ? `${pre} in ${genHMS(td)}` :
                `${pre} between now (${genTOD(null, true, true)}) and deadline`
}

// The state has eep hours, eep pings, deadline, time to deadline, and 
// probability. If deadline is positive then it's a fixed time-of-day and we
// auto-refresh the probability as the deadline approaches. If deadline is 
// negative and the time to deadline positive then the deadline is relative
// (like "+8h") and the probability is fixed and we don't auto-refresh it.
// One or the other of deadline and time-to-deadline is always negative.
class Tminder extends React.Component {
  constructor(props) { super(props); this.state = {
    eh: 0,         // emergency hours
    ep: 0,         // emergency pings
    dl: 0,         // deadline time-of-day as seconds after midnight
    td: -1,        // time to deadline in seconds (invariant: dl<0 or td<0)
    pr: 1,         // probability
  } }
  
  // run every second to refresh probability (& time to deadline)
  tickp = () => // Glitch editor thinks there's a syntax error here but tis fine
    this.setState({pr: pingprob(this.state.ep, pumpkin(this.state.dl))})

  tickd = () => this.setState() // run every minute to refresh just deadline
  
  // Even if we're not auto-refreshing the probability every second, still
  // refresh the deadline time every minute
  componentWillMount = () => { setInterval(this.tickd, 60000) }

  chgH = e => { // do this when the 'hours needed' field changes
    let heep = e.target.value // contents of the actual field
    if (/^\s*$/.test(heep)) { heep = "0h" } // blank hours needed => 0 hours
    let eh = parseHMS(heep)/3600
    let ep = Math.max(0, Math.ceil(eh/GAP))

    let dl = this.state.dl
    let td = this.state.td
    let pr
    if (dl<0) { pr = pingprob(ep, td)          }
    if (td<0) { pr = pingprob(ep, pumpkin(dl)) }
    this.setState({eh, ep, pr})
    // Do the following to start auto-refresh as soon as you first edit hours:
    if (this.state.td<0 && TID===null) { TID = setInterval(this.tickp, 1000) }
  }
  
  chgD = e => { // do this when the deadline field changes
    let dead = e.target.value // contents of the actual field
    let ep = this.state.ep
    let dl, td, pr
    if (/^\+/.test(dead)) {    // starts w/ "+" so deadline is relative & static
      clearInterval(TID); TID = null
      td = parseHMS(dead)
      dl = -1
      pr = pingprob(ep, td)
    } else { // a fixed deadline time so autorefresh the probability as it nears
      if (TID===null) { TID = setInterval(this.tickp, 1000) }
      if (/^\s*$/.test(dead)) { dead = "12am" }
      dl = parseTOD(dead)
      td = -1
      pr = pingprob(ep, pumpkin(dl))
    }
    this.setState({dl, td, pr})
  }
  
  render() { return ( <div>
    <div className="control-group">
      <label className="control-label" for="heep">
        Hours needed (eg, 2h15m or 0:45*3 for 3 pings):
      </label>
      <div className="controls">
        <input className="form-control" type="text" autofocus
               placeholder="arithmetical expression or H:MM"
               onChange={this.chgH}/>
        &nbsp; {sheep(this.state.eh, this.state.ep)}
      </div>
      
      <label className="control-label" for="dead">
        Deadline (eg, 9pm or 12:30 or +1h5m or 2p-1h):
      </label>
      <div className="controls">
        <input className="form-control" type="text"
               placeholder="time of day or amount of time" 
               onChange={this.chgD}/>
        &nbsp; {shead(this.state.dl, this.state.td)}
      </div>
    </div>
    <div className="probability">
      <p className="implies">{shp(this.state.pr)}</p>
      <p>{shpost(this.state.ep, this.state.dl, this.state.td)}</p>
    </div>
  </div> ) }
}

/*
class Tinv extends React.Component {
  render() { return ( <p>{ig(.999, 6, GAP)}</p> ) }
}
*/

ReactDOM.render(<Tminder/>, document.getElementById('root'))
//ReactDOM.render(<Tinv/>, document.getElementById('tinv'))