import type { Noble } from '../../game/types';
import { GEM_COLORS } from '../../game/data/constants';
import { NOBLE_NAMES } from '../../game/data/nobles';
import { GemIcon, CrownIcon } from '../common/icons';

export function NobleView({ noble }: { noble: Noble }) {
  return (
    <div className="noble" title={NOBLE_NAMES[noble.id]}>
      <div className="noble-head">
        <CrownIcon size={26} />
        <span className="noble-pts">3</span>
      </div>
      <div className="noble-req">
        {GEM_COLORS.filter((c) => noble.requirement[c] > 0).map((c) => (
          <span key={c} className="cost-pip">
            <GemIcon color={c} size={13} />
            {noble.requirement[c]}
          </span>
        ))}
      </div>
      <div className="noble-name">{NOBLE_NAMES[noble.id]}</div>
    </div>
  );
}
