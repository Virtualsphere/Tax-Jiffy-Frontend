
import styles from '../GSTR1Page.module.css';

interface GSTR1BasicTabProps {
  data: any[];
}

export function GSTR1BasicTab({ data }: GSTR1BasicTabProps) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table className={styles.draftTable}>
        <thead>
          <tr>
            <th className={styles.draftThSr}>SR.</th>
            <th>PARTICULARS</th>
            <th>DETAILS / VALUES</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className={styles.draftTdSr}>{row.sr}</td>
              <td>
                <span className={styles.draftParticularsLabel}>{row.label}</span>
                <span className={styles.draftParticularsSub}>{row.sub}</span>
              </td>
              <td>
                {row.highlight ? (
                  <span className={styles.draftValueHighlight}>{row.value}</span>
                ) : (
                  <span className={styles.draftValue}>{row.value}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
